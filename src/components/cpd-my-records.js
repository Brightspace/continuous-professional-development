import '@brightspace-ui/core/components/button/button';
import '@brightspace-ui/core/components/button/button-icon';
import '@brightspace-ui/core/components/button/button-subtle';
import '@brightspace-ui/core/components/dialog/dialog-confirm';
import '@brightspace-ui/core/components/inputs/input-checkbox';
import '@brightspace-ui/core/components/inputs/input-date';
import '@brightspace-ui/core/components/inputs/input-search';
import '@brightspace-ui/core/components/dropdown/dropdown-button';
import '@brightspace-ui/core/components/dropdown/dropdown-menu';
import '@brightspace-ui/core/components/menu/menu';
import '@brightspace-ui/core/components/menu/menu-item-link';
import '@brightspace-ui/core/components/link/link';
import 'd2l-navigation/d2l-navigation-link-back';
import './page-select';
import './filter-select';
import './message-container';
import './progress-box';
import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin';
import { CpdServiceFactory } from '../services/cpd-service-factory';
import { cpdSharedStyles } from '../styles/cpd-shared-styles';
import { cpdTableStyles } from '../styles/cpd-table-styles';
import { formatDate } from '@brightspace-ui/intl/lib/dateTime';
import { getHoursAndMinutes } from '../helpers/time-helper';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles';

class MyCpdRecords extends BaseMixin(LitElement) {

	static get properties() {
		return {
			cpdRecords: {
				type: Object
			},
			subjectOptions: {
				type: Array
			},
			methodOptions: {
				type: Array
			},
			subjectFilterEnabled: {
				type: Boolean
			},
			methodFilterEnabled: {
				type: Boolean
			},
			cpdService: {
				type: Object
			},
			page: {
				type: Number
			},
			progress: {
				type: Object
			},
			filters: {
				type: Object
			},
			hideSearchOptions: {
				type: Boolean
			},
			userDisplayName: {
				type: String
			},
			viewUserId: {
				type: Number
			},
			hasEnforcedTarget: {
				type: Boolean
			},
			printRecordLink: {
				type: String
			}
		};
	}

	static get styles() {
		return [
			cpdSharedStyles,
			cpdTableStyles,
			selectStyles,
			css`
			div[role=main] {
				display: grid;
				grid-gap: 36px;
			}

			d2l-button {
				width: min-content;
			}

			d2l-button-subtle {
				width: min-content;
			}

			.search_options {
				display: grid;
				gap: 36px;
			}

			.search_options[disabled] {
				display: none;
			}

			.printLink {
				display: grid;
				grid-gap: 6px;
				grid-auto-flow: column;
				grid-template-columns: 30px 90px;
				align-items: center;
				margin-left: 12px;
			}

			.printLink[dir="rtl"] {
				margin-left: 0px;
				margin-right: 12px;
			}

			.header {
				display: flex;
			}
			`
		];
	}

	constructor() {
		super();

		this.subjectOptions = [];
		this.methodOptions = [];

		this.subjectFilterEnabled = true;
		this.methodFilterEnabled = true;

		this.cpdService = CpdServiceFactory.getCpdService();

		this.page = 1;

		this.filters = {};

		this.hideSearchOptions = true;
	}

	connectedCallback() {
		super.connectedCallback();

		this.fetchRecords();
		this.cpdService.getSubjects()
			.then(data => {
				this.subjectOptions = data;
			});
		this.cpdService.getMethods()
			.then(data => {
				this.methodOptions = data;
			});
		this.cpdService.getUserInfo(this.viewUserId)
			.then(data => {
				this.userDisplayName = data;
			});
		this.updatePrintRecordLink();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	d2lMenuItemSelectListener(event) {
		const itemText = event.target.getAttribute('id');
		if (itemText === 'print_records') {
			window.open(this.printRecordLink, '_blank');
		} else {
			this.cpdService.getCsvExport(this.viewUserId, this.getCsvFileName());
		}
	}

	getCsvFileName() {
		const now = new Date();
		return `${this.userDisplayName}_${now.toLocaleDateString()} ${now.toLocaleTimeString()}.csv`;
	}

	backToTeamClicked() {
		this.fireNavigationEvent({page: 'cpd-my-team'});
	}

	deleteRecord(e) {
		const recordId = e.target.getAttribute('record-id');
		if (recordId && e.detail.action === 'yes') {
			this.cpdService.deleteRecord(recordId)
				.then(() => {
					this.fetchRecords();
				});
		}
	}

	deleteRecordButtonClicked(e) {
		const dialog = this.shadowRoot.querySelector('d2l-dialog-confirm');
		const recordId = e.target.getAttribute('record-id');
		dialog.setAttribute('record-id', recordId);
		dialog.opened = true;
	}

	getType(isStructured) {
		return isStructured ? this.localize('structured') : this.localize('unstructured');
	}

	fetchRecords() {
		this.cpdService.getRecordSummary(this.page, this.viewUserId, this.filters)
			.then(data => {
				this.cpdRecords = data;
			});
		this.cpdService.getProgress(this.viewUserId, this.filters)
			.then((data) =>
				this.progress = this.lowercasePropertyNames(data)
			);
	}

	updatePrintRecordLink() {
		this.printRecordLink = this.cpdService.printRecordLink(this.filters, this.viewUserId);
	}

	newRecordButtonClicked() {
		this.fireNavigationEvent({page:'cpd-add-record'});
	}

	recordLinkClicked(e) {
		if (!this.viewUserId) {
			this.fireNavigationEvent(
				{
					page: 'cpd-edit-record',
					recordId: e.target.getAttribute('record-id')
				}
			);
		} else {
			this.fireNavigationEvent(
				{
					page:'cpd-read-only-record',
					recordId: e.target.getAttribute('record-id'),
					viewUserId: this.viewUserId
				}
			);
		}

	}

	updatePage(e) {
		this.page = e.detail.page;
		this.fetchRecords();
	}

	updateFilter(e) {
		switch (e.target.id) {
			case 'search_input':
				this.filters.Name = e.detail;
				break;
			case 'subject_select':
				this.filters.Subject = e.detail;
				break;
			case 'method_select':
				this.filters.Method = e.detail;
				break;
			case 'start_date_picker':
				this.filters.StartDate = e.target.value;
				break;
			case 'end_date_picker':
				this.filters.EndDate = e.target.value;
				break;
		}
		this.page = 1;
		this.updatePrintRecordLink();
		this.fetchRecords();
	}

	toggleSearchOptions() {
		this.hideSearchOptions = !this.hideSearchOptions;
	}

	renderTable() {
		return html`
		<table
			aria-label="${this.localize('ariaCpdTable')}"
			>
			<thead>
				<tr>
					<th>
						${this.localize('name')}
					</th>


					<th>
						${this.localize('subject')}
					</th>


					<th>
						${this.localize('type')}
					</th>


					<th>
						${this.localize('method')}
					</th>


					<th>
						${this.localize('creditHours')}
					</th>


					<th>
						${this.localize('dateCompleted')}
					</th>
				</tr>
			</thead>

			<tbody>
				${ this.cpdRecords.RecordSummaries.map(record => this.renderRecord(record)) }
			</tbody>
		</table>

		<div class="pageControl">
			<d2l-page-select
				pages="${this.cpdRecords.TotalPages}"
				page="${this.page}"
				@d2l-page-select-updated="${this.updatePage}"
				>
			</d2l-page-select>
		</div>
		`;
	}

	renderRecord(record) {
		const {recordName} = record;
		return html`
		<tr role="row">
			<td>
				<d2l-link @click="${this.recordLinkClicked}" record-id="${record.RecordId}">
					${record.RecordName}
				</d2l-link>
				${this.viewUserId ? html`` : html`
					<d2l-button-icon
						@click="${this.deleteRecordButtonClicked}"
						icon="tier1:delete"
						text="${this.localize('deleteItem', {itemName: recordName})}"
						record-id="${record.RecordId}">
					</d2l-button-icon>
					<d2l-dialog-confirm title-text="${this.localize('deleteItem', {itemName: recordName})}" text="${this.localize('confirmDeleteRecord')}" @d2l-dialog-close="${this.deleteRecord}" >
						<d2l-button slot="footer" primary dialog-action="yes">${this.localize('yes')}</d2l-button>
						<d2l-button slot="footer" dialog-action>${this.localize('no')}</d2l-button>
					</d2l-dialog-confirm>
				`}
			</td>
			<td>
				${record.SubjectName}
			</td>
			<td>
				${this.getType(record.IsStructured)}
			</td>
			<td>
				${record.MethodName}
			</td>
			<td>
				${this.localize('shortTimeDuration', getHoursAndMinutes(record.CreditMinutes))}
			</td>
			<td>
				${formatDate(new Date(record.DateCompleted))}
			</td>
		</tr>
		`;
	}

	renderShowHideButtonText() {
		return this.hideSearchOptions ? this.localize('showSearchOptions') : this.localize('hideSearchOptions');
	}

	renderHeader(viewUserId) {
		if (viewUserId) {
			return html`
				<div>
					<div>
						<d2l-navigation-link-back
							text="${this.localize('backToTeam')}"
							@click="${this.backToTeamClicked}"
							href="javascript:void(0)">
						</d2l-navigation-link-back>
					</div>
					<div class="header">
						<h2>
							${this.localize('userTitle', { 'userDisplayName': this.userDisplayName})}
						</h2>
						<div class="printLink">
							<d2l-dropdown-button primary text="${this.localize('printExportRecords')}">
								<d2l-dropdown-menu>
									<d2l-menu>
										<d2l-menu-item-link text="${this.localize('printRecords')}" id="print_records" @click="${this.d2lMenuItemSelectListener}"></d2l-menu-item-link>
										<d2l-menu-item-link text="${this.localize('exportRecords')}" id="export_records" @click="${this.d2lMenuItemSelectListener}"></d2l-menu-item-link>
									</d2l-menu>
								</d2l-dropdown-menu>
							</d2l-dropdown-button>
						</div>
					</div>
				</div>`;
		}
		return html ``;
	}

	render() {
		return html`
			<div role="main">
				${this.renderHeader(this.viewUserId)}
				<d2l-cpd-progress-box ?hasEnforcedTarget=${this.hasEnforcedTarget} viewUserId=${this.viewUserId} .progress="${this.progress}"></d2l-cpd-progress-box>
				${this.viewUserId ? html `` : html`
					<div class="header">
						<d2l-button id="new_record" primary @click="${this.newRecordButtonClicked}">
							${this.localize('addNewCPD')}
						</d2l-button>
						<div class="printLink">
							<d2l-dropdown-button primary text="${this.localize('printExportRecords')}">
								<d2l-dropdown-menu>
									<d2l-menu>
										<d2l-menu-item-link text="${this.localize('printRecords')}" id="print_records" @click="${this.d2lMenuItemSelectListener}"></d2l-menu-item-link>
										<d2l-menu-item-link text="${this.localize('exportRecords')}" id="export_records" @click="${this.d2lMenuItemSelectListener}"></d2l-menu-item-link>
									</d2l-menu>
								</d2l-dropdown-menu>
							</d2l-dropdown-button>
						</div>
					</div>
				`}
				<div class="searchContainer">
					<d2l-input-search
						id="search_input"
						label="${this.localize('search')}"
						placeholder=${this.localize('searchRecordPlaceholder')}
						@d2l-input-search-searched="${this.updateFilter}"
						>
					</d2l-input-search>

					<d2l-button-subtle
						text="${this.renderShowHideButtonText()}"
						@click="${this.toggleSearchOptions}"
						>
					</d2l-button-subtle>
				</div>

				<div
					class="search_options"
					?disabled=${this.hideSearchOptions}
					>
					<d2l-filter-select
						id="subject_select"
						label="${this.localize('subject')}"
						.options=${this.subjectOptions}
						@d2l-filter-select-updated="${this.updateFilter}"
						>
					</d2l-filter-select>

					<d2l-filter-select
						id="method_select"
						label="${this.localize('method')}"
						.options=${this.methodOptions}
						@d2l-filter-select-updated="${this.updateFilter}"
						>
					</d2l-filter-select>

					<div>
						<label id="date_label">${this.localize('dateRange')}</label>
						<div class="dateFilterControls">
							<d2l-input-date
								label="Start"
								label-hidden
								id="start_date_picker"
								@change="${this.updateFilter}"
								></d2l-input-date>
							<label>${this.localize('to')}</label>
							<d2l-input-date
								label="End"
								label-hidden
								id="end_date_picker"
								@change="${this.updateFilter}"
								></d2l-input-date>
						</div>
					</div>
				</div>
				${this.cpdRecords && this.cpdRecords.RecordSummaries && this.cpdRecords.RecordSummaries.length > 0 ?
		this.renderTable() : html`<d2l-message-container message="${this.localize('noResultsFound')}"></d2l-message-container>`
}
			</div>
			`;
	}
}
customElements.define('d2l-cpd-my-records', MyCpdRecords);
