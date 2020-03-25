import './progress-overall';
import './progress-subject';
import './cpd-sbg-logo';
import './cpd-report-logo';
import 'd2l-html-editor/d2l-html-editor';
import '@brightspace-ui/core/components/button/button';
import '@brightspace-ui/core/components/colors/colors';
import { css, html, LitElement } from 'lit-element/lit-element';
import { getHoursAndMinutes, toLocalDate } from '../helpers/time-helper';
import { heading1Styles, heading2Styles, heading3Styles } from '@brightspace-ui/core/components/typography/styles';
import { BaseMixin } from '../mixins/base-mixin';
import { CpdServiceFactory } from '../services/cpd-service-factory';
import { cpdSharedStyles } from '../styles/cpd-shared-styles';
import { cpdTableStyles } from '../styles/cpd-table-styles';
import { decimalToPercent } from '../helpers/record-helper';
import { formatDate } from '@brightspace-ui/intl/lib/dateTime';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

class CpdRecordReport extends BaseMixin(LitElement) {

	static get properties() {
		return {
			cpdService: {
				type: Object
			},
			userInfo: {
				type: Object
			},
			target: {
				type: Object
			},
			questions: {
				type: Object
			},
			records: {
				type: Array
			},
			progress: {
				type: Object
			},
			userId: {
				type: Number
			},
			filters: {
				type: Object
			}
		};
	}

	static get styles() {
		return [
			cpdTableStyles,
			cpdSharedStyles,
			heading1Styles,
			heading2Styles,
			heading3Styles,
			css`
			.report-header {
				display: grid;
				grid-template-columns: 1fr 1fr;
			}
			.bold {
				font-weight: bold;
			}
			.record-grid {
				display: grid;
				grid-template-columns: 1fr 3fr;
				border: 1px black solid;
				page-break-before: always;
				margin-top: 20px;
			}
			.container {
				padding-left: 75px;
				padding-right: 75px;
			}
			.qa-text {
				grid-column: span 2;
				margin: 20px;
			}
			.qa-text > * {
				margin-top: 0px;
				margin-bottom: 0px;
			}
			d2l-html-editor {
				border: none;
				margin: 10px;
			}
			.record-grid > .d2l-heading-3 {
				justify-self: end;
				align-self: start;
			}
			.record-grid > .record-data {
				align-self: center;
				margin-left: 10px;
			}
			.record-grid > * {
				margin-top: 0.2rem;
				margin-bottom: 0.2rem;
			}
			.print-button {
				float: right;
				margin: 12px;
			}
			.print-button[dir="rtl"] {
				float: left;
			}
			.progress-header {
				margin-top: 60px;
				margin-bottom: 20px;
			}
			p.attachment {
				margin-top: 0.2rem;
			}
			.logo-container {
				align-self: center;
				justify-self: end;
			}
			@media print {
				.container {
					padding: 0px;
					width: 7.5in;
				}
				.print-button {
					display: none;
				}
			}
			`
		];
	}

	constructor() {
		super();

		this.cpdService = CpdServiceFactory.getCpdService();

		this.userInfo = {};
		this.records = [];
		this.questions = [];
		this.progress = {};
		this.filters = {};
		this.types = this.cpdService.getTypes();
	}

	connectedCallback() {
		super.connectedCallback();

		this.cpdService.getUserInfo(this.userId)
			.then(body => {
				this.userInfo.DisplayName = body;
			});
		this.cpdService.getTargetRecords(this.userId)
			.then(body => {
				this.records = body;
			});
		this.cpdService.getProgress(this.userId)
			.then(body => {
				this.progress = this.lowercasePropertyNames(body);
				this.target = {
					rangeStart: this.formatDateString(toLocalDate(this.progress.startdate)),
					rangeEnd: this.formatDateString(toLocalDate(this.progress.enddate))
				};
			});
		this.cpdService.getQuestions()
			.then(body => {
				const reducer = (accumulator, currentValue) => {
					accumulator[currentValue.Id] = currentValue.QuestionText;
					return accumulator;
				};
				this.questions = body.reduce(reducer, {});
			});
	}

	formatDateString(inputDate) {
		return `${formatDate(inputDate, {format: 'medium'})}`;
	}

	print() {
		window.print();
	}

	renderRecord(record) {
		return html`
			<div class="record-grid">
				<div class="d2l-heading-3">${this.localize('headingRecordName')}</div>
				<div class="record-data">${record.Name}</div>
				<div class="d2l-heading-3">${this.localize('headingCreditHours')}</div>
				<div class="record-data">${this.localize('shortTimeDuration', getHoursAndMinutes(record.CreditMinutes))}</div>
				<div class="d2l-heading-3">${this.localize('headingDateCompleted')}</div>
				<div class="record-data">${formatDate(new Date(record.DateCompleted))}</div>
				<div class="d2l-heading-3">${this.localize('headingSubject')}</div>
				<div class="record-data">${record.Subject.Name}</div>
				<div class="d2l-heading-3">${this.localize('headingRecordType')}</div>
				<div class="record-data">${this.types.find(type => !!type.Id === record.IsStructured).Name}</div>
				<div class="d2l-heading-3">${this.localize('headingMethod')}</div>
				<div class="record-data">${record.Method.Name}</div>
				<div class="d2l-heading-3">${this.localize('headingGrade')}</div>
				<div class="record-data">${ record.Grade ? this.localize('percent', decimalToPercent(record.Grade)) : this.localize('na') }</div>
				<div class="d2l-heading-3">${this.localize('headingEvidence')}</div>
				${this.renderAttachments(record.Attachments)}
				${record.Answers.map(answer => this.renderAnswer(record.Id, answer))}
			</div>
		`;
	}

	renderAttachments(attachments) {
		if (attachments && attachments.Files) {
			return html`
			<div class="record-data">
				${attachments.Files.map(file => html`<p class="attachment">${file.Name}</p>`)}
			</div>
			`;
		}
		return html`<div class="record-data">${this.localize('na')}</div>`;
	}

	renderAnswer(recordId, answer) {
		const question = this.questions[answer.QuestionId];
		return html`
			<div class="qa-text">
				<div class="d2l-heading-3">
					${question}
				</div>
				<div>
					${unsafeHTML(answer.Text)}
				</div>
			<div>
		`;
	}

	render() {
		return html`
			<div class="container d2l-typography">
				<d2l-button class="print-button" primary @click="${this.print}">${this.localize('printRecords')}</d2l-button>
				<div class="report-header">
					<div>
						<div class="d2l-heading-1">${this.localize('cpdLog')}</div>
						<div class="d2l-heading-3">${this.localize('userDetails')}</div>
						<div>
							<span class="d2l-heading-3">${this.localize('headingName')}</span>
							${this.userInfo.DisplayName}
						</div>
						<div>
							<span class="d2l-heading-3">${this.localize('cpdPeriod')}</span>
							${this.localize('range', this.target)}
						</div>
					</div>
					<div class="logo-container">
						<d2l-cpd-sbg-logo></d2l-cpd-sbg-logo>
					</div>
				</div>
				<div class="d2l-heading-2 progress-header">${this.localize('overallProgressSummary')}</div>
				<d2l-progress-overall
					.progress="${this.progress}"
					>
				</d2l-progress-overall>
				<div class="d2l-heading-2 progress-header">${this.localize('subjectProgressSummary')}</div>
				<d2l-progress-subject
					.progress="${this.progress}">
				</d2l-progress-subject>
				${this.records.map(record => this.renderRecord(record))}
			</div>
		`;
	}
}
customElements.define('d2l-cpd-record-report', CpdRecordReport);
