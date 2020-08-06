
import 'd2l-navigation/d2l-navigation-link-back';
import '@brightspace-ui/core/components/button/button-icon';
import '@brightspace-ui/core/components/button/button';
import '@brightspace-ui/core/components/dialog/dialog';
import '@brightspace-ui/core/components/inputs/input-checkbox';
import '@brightspace-ui/core/components/inputs/input-text';
import { css, html, LitElement } from 'lit-element/lit-element';
import { formatDate, getDateTimeDescriptor } from '@brightspace-ui/intl/lib/dateTime';
import { getCurrentDate, getHours, getHoursAndMinutes, getMinutes, getMonthFromDate, getNonLeapYearDate, getTotalMinutes, toLocalDate } from  '../helpers/time-helper';
import { BaseMixin } from '../mixins/base-mixin';
import { CpdServiceFactory } from '../services/cpd-service-factory';
import { cpdTableStyles } from '../styles/cpd-table-styles';
import { radioStyles } from '@brightspace-ui/core/components/inputs/input-radio-styles';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

class ManageCpdTargets extends BaseMixin(LitElement) {
	static get properties() {
		return {
			subjectTargets: {
				type: Object
			},
			selectedTargetMonth: {
				type: Number
			},
			selectedTargetDay: {
				type: Number
			},
			months: {
				type: Array
			},
			days: {
				type: Array
			},
			isRollingTarget: {
				type: Boolean
			},
			jobTitle: {
				type: String
			},
			dialogData: {
				type: Object
			},
			dateDialogData: {
				type: Object
			}
		};
	}

	static get styles() {
		return [
			radioStyles,
			selectStyles,
			cpdTableStyles,
			css`
			span.selected-date {
				font-weight: bold;
			}
			.dialog-grid {
				display: grid;
				grid-template-columns: 1fr 1fr;
				grid-gap: 25px;
			}
			label {
				font-weight: bold;
			}
			.radio-buttons-container {
				grid-column-start: 1;
				grid-column-end: 3;
			}`
		];
	}

	constructor() {
		super();
		this.cpdService = CpdServiceFactory.getCpdService();
		this.months = getDateTimeDescriptor().calendar.months.long;
		const today = getCurrentDate();
		this.setSelectedTargetDate(getMonthFromDate(today), today.getDate());
		this.dialogData = {};
		this.dateDialogData = {};
		this.isRollingTarget = true;
	}

	async connectedCallback() {
		super.connectedCallback();
		this.fetchTargets();
	}

	fetchTargets() {
		this.cpdService.getSubjectTargets(this.jobTitle)
			.then(body => {
				this.subjectTargets = body;
				if (body.StartDate) {
					const date = toLocalDate(body.StartDate);
					this.setSelectedTargetDate(date.getMonth() + 1, date.getDate());
					this.isRollingTarget = false;
				}
			});
	}

	selectedDateString() {
		const date = getNonLeapYearDate(this.selectedTargetMonth, this.selectedTargetDay);
		return `${formatDate(date, {format: 'monthDay'})}`;
	}

	render() {
		return html`
			<main>
				<d2l-navigation-link-back
					text="${(this.jobTitle) ? this.localize('backToJobCpd') : this.localize('backToMyCPD')}"
					@click="${this.backLinkClicked}"
					href="javascript:void(0)">
				</d2l-navigation-link-back>
				<h2>${(this.jobTitle) ? this.localize('manageJobTargets', {title:this.jobTitle}) : this.localize('managePersonalTargets')}</h2>

				<h3>${this.localize('targetStartDay')}</h3>
				<p>
					${this.localize('targetStartDayDescription')}
				</p>

				${this.renderTargetSelection()}


				<h3>${this.localize('subjectTargets')}</h3>
				<table aria-label="${this.localize('ariaTargetsTable')}">
					<thead>
						<tr>
							<th>
								${this.localize('subject')}
							</th>
							<th>
								${this.localize('structured')}
							</th>
							</th>
							<th>
								${this.localize('unstructured')}
							</th>
							<th>
								${this.localize('total')}
							</th>
						</tr>
					</thead>

					<tbody>
						${this.subjectTargets && this.subjectTargets.Subjects && this.subjectTargets.Subjects.map(subject => this.renderSubjectTargets(subject))}
					</tbody>
				</table>

				<d2l-dialog id="subject-target-hours-dialog" title-text="${this.localize('subjectTargets')}">
					<div class="dialog-grid">
						<div>
							<label for="structured">${this.localize('structured')}</label>
							<div id="structured">
								<label for="structuredHours">${this.localize('hours')}</label>
								<d2l-input-text
									@blur="${this.onDialogDataUpdated}"
									id="structuredHours"
									class="numberInput"
									required type="number"
									min="0"
									value="${getHours(this.dialogData.StructuredMinutes)}"
									novalidate
								>
								</d2l-input-text>
								<label for="structuredMinutes">${this.localize('minutes')}</label>
								<d2l-input-text
									@blur="${this.onDialogDataUpdated}"
									id="structuredMinutes"
									class="numberInput"
									required type="number"
									min="0"
									max="59"
									value="${getMinutes(this.dialogData.StructuredMinutes)}"
									novalidate
								>
								</d2l-input-text>
							</div>
						</div>
						<div>
							<label for="unstructured">${this.localize('unstructured')}</label>
							<div id="unstructured">
								<label for="unstructuredHours">${this.localize('hours')}</label>
								<d2l-input-text
									@blur="${this.onDialogDataUpdated}"
									id="unstructuredHours"
									class="numberInput"
									required
									type="number"
									min="0"
									value="${getHours(this.dialogData.UnstructuredMinutes)}"
									novalidate
								>
								</d2l-input-text>
								<label for="unstructuredMinutes">${this.localize('minutes')}</label>
								<d2l-input-text
									@blur="${this.onDialogDataUpdated}"
									id="unstructuredMinutes"
									class="numberInput"
									required
									type="number"
									min="0"
									max="59"
									value="${getMinutes(this.dialogData.UnstructuredMinutes)}"
									novalidate
								>
								</d2l-input-text>
							</div>
						</div>
					</div>
					<d2l-button slot="footer" primary dialog-action @click="${this.saveTargets}">${this.localize('save')}</d2l-button>
					<d2l-button slot="footer" dialog-action>${this.localize('cancel')}</d2l-button>
				</d2l-dialog>
			</main>
		`;
	}

	renderTargetSelection() {
		return html `
			<div>
				<div>
					<label class="d2l-label-text">
						${this.localize('type')}:
					</label>
					<span>
						${this.isRollingTarget ? this.localize('rollingTarget') : this.localize('specificSps')}
					</span>
					<d2l-button-icon
						icon="tier1:edit"
						text="${this.localize('editTargetPeriod')}"
						@click="${this.openTargetDateDialog}">
					</d2l-button-icon>
				</div>
				<div>
					<label class="d2l-label-text">
						${this.localize('currentTargetPeriod')}
					</label>
					<span>
						${this.selectedDateString()}
					</span>
				</div>
				<d2l-dialog id="target-start-date-dialog" title-text="${this.localize('targetStartDay')}">
					<div class="dialog-grid">
						<div class="radio-buttons-container">
							<label class="d2l-input-radio-label">
								<input
									id="rolling-radio-button"
									type="radio"
									name="targetStartDayType"
									value="rolling"
									@change=${this.targetTypeChanged} />
								${this.localize('rollingTarget')}
							</label>
							<label class="d2l-input-radio-label">
								<input
									id="specific-radio-button"
									type="radio"
									name="targetStartDayType"
									value="specific"
									@change=${this.targetTypeChanged} />
								${this.localize('specificSps')}
							</label>
						</div>
						${this.dateDialogData.isRolling ? html`` : html `
							<label for="monthSelect">${this.localize('month')}</label>
							<label for="daySelect">${this.localize('day')}</label>
							<select
								@change="${this.setSelectedMonth}"
								aria-label="${this.localize('chooseChoice', {choice: this.localize('month')})}"
								class="d2l-input-select"
								id="monthSelect"
							>
								${this.months.map((month, index) => this.renderSelectOption(month, index + 1, this.dateDialogData.month))}
							</select>
							${this.renderDaySelect()}
						`}
					</div>
					<d2l-button slot="footer" primary dialog-action @click="${this.saveTargetDate}">${this.localize('save')}</d2l-button>
					<d2l-button slot="footer" dialog-action>${this.localize('cancel')}</d2l-button>
				</d2l-dialog>
			</div>
		`;
	}

	targetTypeChanged(e) {
		this.dateDialogData = {
			isRolling: Boolean(e.target.value === 'rolling'),
			month: this.dateDialogData.month,
			date: this.dateDialogData.date
		};
		this.updateComplete.then(() => this.shadowRoot.querySelector('#target-start-date-dialog').resize());
	}

	renderSubjectTargets(subject) {
		return html`
			<tr>
				<td>
					${subject.Subject.Name}
					<d2l-button-icon
						subject-json="${JSON.stringify(subject)}"
						icon="tier1:edit"
						text="${this.localize('editSubjectTarget', {subject: subject.Subject.Name})}"
						@click="${this.openSubjectTargetDialog}">
					</d2l-button-icon>
				</td>
				<td>${this.localize('shortTimeDuration', getHoursAndMinutes(subject.StructuredMinutes))}</td>
				<td>${this.localize('shortTimeDuration', getHoursAndMinutes(subject.UnstructuredMinutes))}</td>
				<td>${this.localize('shortTimeDuration', getHoursAndMinutes(subject.StructuredMinutes + subject.UnstructuredMinutes))}</td>
			</tr>
		`;
	}

	backLinkClicked() {
		if (!this.jobTitle) {
			this.fireNavigationEvent({page:'cpd-my-records'});
		} else {
			this.fireNavigationEvent({page:'admin-job-list'});
		}
	}

	renderSelectOption(option, optionIndex, selectedOption) {
		return html`
		<option
			value="${optionIndex}"
			?selected=${selectedOption === optionIndex}
			>
			${option}
		</option>
		`;
	}

	onDialogDataUpdated(e) {
		const number = parseInt(e.target.value);
		switch (e.target.id) {
			case 'structuredHours':
				this.dialogData.StructuredMinutes = getTotalMinutes(number, getMinutes(this.dialogData.StructuredMinutes));
				break;
			case 'structuredMinutes':
				this.dialogData.StructuredMinutes = getTotalMinutes(getHours(this.dialogData.StructuredMinutes), number);
				break;
			case 'unstructuredHours':
				this.dialogData.UnstructuredMinutes = getTotalMinutes(number, getMinutes(this.dialogDataUnstructuredMinutes));
				break;
			case 'unstructuredMinutes':
				this.dialogData.UnstructuredMinutes = getTotalMinutes(getHours(this.dialogData.UnstructuredMinutes), number);
				break;
		}
	}

	openTargetDateDialog() {
		this.setDateDialogData(this.isRollingTarget, this.selectedTargetMonth, this.selectedTargetDay);
		this.shadowRoot.querySelector('#specific-radio-button').checked = !this.isRollingTarget;
		this.shadowRoot.querySelector('#rolling-radio-button').checked = this.isRollingTarget;
		this.shadowRoot.querySelector('#target-start-date-dialog').open();
	}

	openSubjectTargetDialog(e) {
		const subject = e.target.getAttribute('subject-json') &&
			JSON.parse(e.target.getAttribute('subject-json'));
		this.dialogData = {
			SubjectId: subject.Subject.Id,
			StructuredMinutes: subject.StructuredMinutes,
			UnstructuredMinutes: subject.UnstructuredMinutes
		};
		this.shadowRoot.querySelector('#subject-target-hours-dialog').open();
	}

	saveTargetDate() {
		this.isRollingTarget = this.dateDialogData.isRolling;
		if (this.isRollingTarget) {
			const today = getCurrentDate();
			this.setSelectedTargetDate(getMonthFromDate(today), today.getDate());
			this.cpdService.updateTargetDate(null, this.jobTitle);
		} else {
			this.setSelectedTargetDate(this.dateDialogData.month, this.dateDialogData.date);
			const date = new Date();
			date.setMonth(this.selectedTargetMonth - 1);
			date.setDate(this.selectedTargetDay);
			this.cpdService.updateTargetDate(date.toJSON(), this.jobTitle);
		}
	}

	saveTargets() {
		this.cpdService.updateTarget(this.jobTitle, this.dialogData)
			.then(() => this.fetchTargets());
	}

	renderDaySelect() {
		const daysInMonth = function(month) {
			const nonLeapYear = 2019;
			return new Date(nonLeapYear, month, 0).getDate();
		};

		const numberOfDays = daysInMonth(this.dateDialogData.month || 1);
		const days = Array.from({
			length: numberOfDays
		}, (v, index) => {
			return index + 1;
		});
		if (numberOfDays < this.dateDialogData.date) {
			this.dateDialogData.date = 1;
		}
		return html`
		<select
			@change="${this.setSelectedDay}"
			aria-label="${this.localize('chooseChoice', {choice: this.localize('day')})}"
			class="d2l-input-select"
			id="daySelect"
		>
			${days.map((day, index) => this.renderSelectOption(day, index + 1, this.dateDialogData.date || 1))}
		</select>
		`;
	}
	setSelectedDay(event) {
		if (event.target.value) {
			this.dateDialogData.date = Number(event.target.value);
		}
	}

	setSelectedMonth(event) {
		if (event.target.value) {
			this.dateDialogData.month = Number(event.target.value);
		}
	}

	setSelectedTargetDate(month, day) {
		this.selectedTargetMonth = month;
		this.selectedTargetDay = day;
	}

	setDateDialogData(isRolling, month, date) {
		this.dateDialogData = { isRolling, month, date };
	}
}

customElements.define('d2l-cpd-manage-targets', ManageCpdTargets);
