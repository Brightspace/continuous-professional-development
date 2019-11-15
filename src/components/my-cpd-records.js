import '@brightspace-ui/core/components/button/button.js';
import '@brightspace-ui/core/components/inputs/input-checkbox.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import 'd2l-date-picker/d2l-date-picker.js';
import 'd2l-table/d2l-table.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { LoadDataMixin } from '../mixins/load-data-mixin.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { selectStyles } from '../styles/select-styles.js';

class MyCpdRecords extends LocalizeMixin(LoadDataMixin(LitElement)) {

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
			pageSizeOptions: {
				type: Array
			}
		};
	}

	static get styles() {
		return [
			selectStyles,
			css`
			div[role=main] {
				display: grid;
				grid-gap: 1rem;
			}

			d2l-button {
				width: 25%;
			}

			d2l-input-search {
				width: 35%;
			}

			d2l-date-picker {
				width: 7rem;
			}

			.d2l-date-picker-container {
				display: inline-flex;
				flex-direction: column;
				flex: 1 1 auto;
			}

			.filter_select {
				width: 30%;
			}
			
			.filter_controls {
				display: flex;
				align-items: baseline;
			}
			`
		];
	}

	static async getLocalizeResources(langs) {
		for await (const lang of langs) {
			let translations;
			switch (lang) {
				case 'en':
					translations = await import('../../locales/en.js');
					break;
			}

			if (translations && translations.val) {
				return {
					language: lang,
					resources: translations.val
				};
			}
		}

		return null;
	}

	constructor() {
		super();

		this.cpdRecordsUrl = '';
		this._cpdRecords = {
			data: []
		};
		this.subjectOptions = [];
		this.methodOptions = [];
		this.pageSizeOptions = [];
	}

	get cpdRecords() {
		return this._cpdRecords;
	}

	set cpdRecords(val) {
		const oldVal = this._cpdRecords;
		this._cpdRecords = val;
		this.requestUpdate('cpdRecords', oldVal);
	}

	connectedCallback() {
		super.connectedCallback();

		this.loadCpdRecords(this.cpdRecordsUrl)
			.then(r => {
				this.cpdRecords = r;
			});

	}

	serializeSelect(option) {
		return html`
			<option value="${option}">${option}</option>
		`;
	}

	render() {
		return html`
			<custom-style>
				<style include="d2l-table-style"></style>
			</custom-style>
			<style is="custom-style" include="d2l-input-styles"></style>

			<div role="main">
				<d2l-button id="new_record">
					Add a New CPD Record
				</d2l-button>

				<d2l-input-search 
					id="search_filter"
					placeholder="Search for CPD records..."
					>
				</d2l-input-search>	

				<div id="subject_filter">
					<label id="subject_label">Subject</label>
					<div class="filter_controls">
						<d2l-input-checkbox id="subject_enable"></d2l-input-checkbox>
						<select  
							class="filter_select"
							id="subject_select"
							>
							${this.subjectOptions.}
						</select>
					</div>
				</div>

				<div id="method_filter">
					<label id="method_label">Method</label>
					<div class="filter_controls">
						<d2l-input-checkbox id="method_enable"></d2l-input-checkbox>
						<select  
							class="filter_select"
							id="method_select"
							>
							<option value="a">HI</option>
						</select>
					</div>
				</div>

				<div class="d2l-date-picker-container">
					<d2l-date-picker
						label="aaahhh"
						>
					</d2l-date-picker>
				</div>

				<d2l-table
					id="cpd-records"
					aria-label="${this.localize('ariaCpdTable')}"
				>
					<d2l-thead>
						<d2l-tr role="row">
							<d2l-th>
								${this.localize('lblName')}
							</d2l-th>


							<d2l-th>
								${this.localize('lblSubject')}
							</d2l-th>


							<d2l-th>
								${this.localize('lblType')}
							</d2l-th>


							<d2l-th>
								${this.localize('lblMethod')}
							</d2l-th>


							<d2l-th>
								${this.localize('lblCreditHours')}
							</d2l-th>


							<d2l-th>
								${this.localize('lblDateAdded')}
							</d2l-th>
						</d2l-tr>
					</d2l-thead>

					<d2l-tbody>
						${this.cpdRecords.data.map(record => html`
								<d2l-tr role="row">
									<d2l-td>
										${record.name}
									</d2l-td>
									<d2l-td>
										${record.subject}
									</d2l-td>
									<d2l-td>
										${record.type}
									</d2l-td>
									<d2l-td>
										${record.method}
									</d2l-td>
									<d2l-td>
										${record.credit_hours}
									</d2l-td>
									<d2l-td>
										${record.date_added}
									</d2l-td>
								</d2l-tr>
							`
	)
}
					</d2l-tbody>
				</d2l-thead>
				</d2l-table>
				<select id="page_size_select"></select>
			</div>
					`;
	}
}
customElements.define('d2l-my-cpd-records', MyCpdRecords);
