import '@brightspace-ui/core/components/inputs/input-text.js';
import './attachments';
import 'd2l-date-picker/d2l-date-picker.js';
import 'd2l-navigation/d2l-navigation-link-back.js';
import 'd2l-html-editor/d2l-html-editor';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { BaseMixin } from '../mixins/base-mixin.js';
import { CpdServiceFactory } from '../services/cpd-service-factory';
import { formatDate } from '@brightspace-ui/intl/lib/dateTime';
import { getHoursAndMinutesString } from  '../helpers/time-helper.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

class ReadOnlyCpdRecord extends BaseMixin(LitElement) {
	static get properties() {
		return {
			questions: {
				type: Array
			},
			record: {
				type: Object
			},
			recordId: {
				type: Number
			},
			types: {
				type: Array
			},
			userDisplayName: {
				type: String
			}
		};
	}

	static get styles() {
		return [
			selectStyles,
			css`
		main {
			width: 100%;
		}
		main > ul {
			display: grid;
			grid-template-rows: 1fr 1.5fr 1fr 1fr;
			grid-auto-rows: auto;
		}
		d2l-date-picker {
			width: 7rem;
		}
		d2l-html-editor {
			border-radius: 0.3rem;
			border-style: solid;
			border-width: 1px;
			border-color: initial;
		}
		ul {
			list-style-type: none;
			padding: 0;
			margin: 0;
		}
		li {
			padding: 8px 0px;
		}
		.numberInput {
			width: 200px;
		}
		ul.innerlist {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-items: start;
		}
		ul.innerlist > li {
			list-style: none;
			display: inline-block;
			width: calc(100% / 4);
		  }
		.credit-container {
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-gap: 20px;
		}
		.credit-time-container {
			display: grid;
			grid-template-rows: 1fr;
			grid-template-columns: 1fr 1fr;
		}
		`];
	}

	constructor() {
		super();
		this.cpdService = CpdServiceFactory.getCpdService();
		this.questions =  [];
		this.types = this.cpdService.getTypes();
		this.record = {};
	}

	async connectedCallback() {
		super.connectedCallback();
		await this.cpdService.getRecord(this.recordId)
			.then(body => {
				this.record = body;
			});
		this.cpdService.getQuestions()
			.then(body => {
				this.questions = body;
			});
		this.cpdService.getUserInfo(this.record.User)
			.then(body => {
				this.userDisplayName = body;
			});
	}

	render() {
		return html`
			<main>
				<d2l-navigation-link-back
					text="${this.localize('backToUserRecords', {userName: this.userDisplayName})}"
					@click="${this.backToUserRecordsClicked}"
					href="javascript:void(0)">
				</d2l-navigation-link-back>
				<h2>${this.localize('viewCPD')}</h2>
				<ul>
					<li>
						<label for="recordName" class="d2l-label-text">${this.localize('name')}</label>
						<p id="recordName">${this.record.Name}</p>
					</li>
					<li>
						<ul class="innerlist">
							<li>
								<label for="type">${this.localize('type')}</label>
								<p id="type">
									${this.types.find(type => !!type.Id === this.record.IsStructured).Name}
								</p>
							</li>
							<li>
								<label for="subject">${this.localize('subject')}</label>
								<p id="subject">${this.record.Subject.Name}</p>
							</li>
							<li>
								<label for="method">${this.localize('method')}</label>
								<p id="method">${this.record.Method.Name}</p>
							</li>
						</ul>
					</li>
					<li>
						<div class="credit-container">
							<div>
								<label for="creditMinutes" class="d2l-label-text">${this.localize('creditHours')}</label>
								<p id="creditMinutes">${getHoursAndMinutesString(this.record.CreditMinutes)}</p>
							</div>
							<div>
								<label for="gradeValue" class="d2l-label-text">${this.localize('grade')}</label>
								<p id="gradeValue">${this.record.Grade || this.localize('noGrade')}</p>
							</div>
						</div>
					</li>
					<li>
						<label for="dateCompleted" class=d2l-label-text>${this.localize('dateCompleted')}</label>
						<p>${this.record && this.record.DateCompleted && formatDate(new Date(this.record.DateCompleted))}</p>
					</li>
					<li>
						<label for="evidence">${this.localize('evidence')}</label>
						<div id="evidence">
							${this.renderEvidence(this.record.Attachments)}
						</div>
					</li>
					${this.questions.map((q) => this.renderAnswers(q, this.record.Answers))}
				</ul>
			</main>
		`;
	}

	renderAnswers(question, answers) {
		return html`
			<li>
				<label for="${`answerText_${question.Id}`}">${question.QuestionText}</label>
				<d2l-html-editor
					id=${`answerText_${question.Id}`}
					editor-id=${`answerText_${question.Id}_editor`}
					disabled
					app-root=${`${window.location.href.replace(/[^/]*$/, '')}node_modules/d2l-html-editor/`}
					content="${ encodeURIComponent(answers.find(answer => answer.QuestionId === question.Id).Text)}">
						<div id=${`answerText_${question.Id}_editor`} role="textbox" class="d2l-richtext-editor-container"></div>
				</d2l-html-editor>
			</li>
		`;
	}

	renderEvidence(attachments) {
		if (attachments) {
			return html`<d2l-attachments readonly .attachmentsList="${attachments.Files}"></d2l-attachments>`;
		}
		return this.localize('noEvidence');
	}

	backToUserRecordsClicked() {
		this.fireNavigationEvent({
			page:'cpd-user-records',
			viewUserId: this.record.User
		});
	}
}

customElements.define('d2l-cpd-read-only-record', ReadOnlyCpdRecord);
