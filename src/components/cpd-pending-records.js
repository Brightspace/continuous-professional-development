import '@brightspace-ui/core/components/button/button-icon';
import '@brightspace-ui/core/components/icons/icon.js';
import '@brightspace-ui/core/components/inputs/input-search.js';
import '@brightspace-ui/core/components/link/link.js';
import 'd2l-menu/d2l-menu';
import 'd2l-dropdown/d2l-dropdown';
import 'd2l-dropdown/d2l-dropdown-menu';
import 'd2l-date-picker/d2l-date-picker';
import './message-container';
import './page-select';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { BaseMixin } from '../mixins/base-mixin.js';
import { CpdServiceFactory } from '../services/cpd-service-factory';
import { cpdTableStyles } from '../styles/cpd-table-styles';

class PendingRecords extends BaseMixin(LitElement) {
	static get properties() {
		return {
			pendingRecords: {
				type: Object
			},
			page: {
				type: Number
			},
			filters: {
				type: Object
			},
			hideSearchOptions: {
				type: Boolean
			}
		};
	}

	static get styles() {
		return [
			cpdTableStyles,
			css`
			div[role=main] {
				display: grid;
				grid-gap: 1rem;
			}

			d2l-input-search {
				width: 35%;
			}

			d2l-date-picker {
				width: 7rem;
			}

			.date_filter_controls {
				width: 16rem;
				display: flex;
				justify-content: space-between;
				align-items: baseline;
			}

			.page_control {
				width: 100%;
				display: flex;
				justify-content: center;
			}

			.search_options[disabled] {
				display: none;
			}
			`
		];
	}

	constructor() {
		super();
		this.cpdService = CpdServiceFactory.getCpdService();
		this.page = 1;
		this.hideSearchOptions = true;
	}

	connectedCallback() {
		super.connectedCallback();

		this.cpdService.getPendingRecords(this.page)
			.then(data => {
				this.pendingRecords = data;
			});
	}

	fetchAwards() {
		this.cpdService.getPendingRecords(this.page, this.filters)
			.then(data => {
				this.pendingRecords = data;
			});
	}

	updateFilter(e) {
		this.filters = this.filters || {};
		switch (e.target.id) {
			case 'search_input':
				this.filters.Name = e.detail;
				break;
			case 'start_date_picker':
				this.filters.StartDate = e.detail;
				break;
			case 'end_date_picker':
				this.filters.EndDate = e.detail;
				break;
		}
		this.page = 1;
		this.fetchAwards();
	}

	updatePage(e) {
		this.page = e.detail.page;
		this.fetchAwards();
	}

	toggleSearchOptions() {
		this.hideSearchOptions = !this.hideSearchOptions;
	}

	renderShowHideButtonText() {
		return this.hideSearchOptions ? this.localize('showSearchOptions') : this.localize('hideSearchOptions');
	}

	addAwardButtonClicked(e) {
		const awardData = e.target.getAttribute('data-award-id');
		this.fireNavigationEvent({
			page: 'cpd-add-record',
			awardData
		});
	}

	renderTable() {
		return html`
		<table
			aria-label="${this.localize('ariaPendingRecordsTable')}"
			>
			<thead>
				<tr>
					<th class="icon_column">
					</th>
					<th>
						${this.localize('name')}
					</th>
					<th>
						${this.localize('dateIssued')}
					</th>
				</tr>
			</thead>

			<tbody>
				${this.pendingRecords && this.pendingRecords.Objects.map(award => this.renderAward(award))}
			</tbody>
		</table>

		<div class="page_control">
			<d2l-page-select
				pages="${ Math.ceil(this.pendingRecords.TotalCount / this.pendingRecords.PageSize) }"
				page="${this.page}"
				@d2l-page-select-updated="${this.updatePage}"
				>
			</d2l-page-select>
		</div>
		`;
	}

	renderAward(award) {
		return html`
			<tr role="row">
				<td class="icon_column">
					<div class="profile_image">
						<d2l-icon icon="tier3:profile-pic"></d2l-icon>
					</div>
				</td>

				<td>
					${award.Name}
					<d2l-dropdown>
						<d2l-button-icon text="${this.localize('options')}" icon="tier1:arrow-collapse" class="d2l-dropdown-opener"></d2l-button-icon>
						<d2l-dropdown-menu>
							<d2l-menu>
								<d2l-menu-item
									data-award-id="${JSON.stringify(award)}"
									text="${this.localize('addToMyCpd')}"
									@click="${this.addAwardButtonClicked}">
									</d2l-menu-item>
							</d2l-menu>
						</d2l-dropdown-menu>
					</d2l-dropdown>
				</td>
				<td>
					${award.IssuedDate}
				</td>
			</tr>
		`;
	}

	render() {
		return html`
			<div role="main">
				<div class="search_bar">
					<d2l-input-search
						id="search_input"
						label="${this.localize('search')}"
						placeholder="${this.localize('searchPendingPlaceholder')}"
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
				<div id="date_filter">
					<label id="date_label">${this.localize('dateRange')}</label>
					<div class="date_filter_controls">
						<d2l-date-picker
							id="start_date_picker"
							@d2l-date-picker-value-changed="${this.updateFilter}"
							></d2l-date-picker>
						<label>${this.localize('to')}</label>
						<d2l-date-picker
							id="end_date_picker"
							@d2l-date-picker-value-changed="${this.updateFilter}"
							></d2l-date-picker>
					</div>
				</div>
			</div>

				${ this.pendingRecords && this.pendingRecords.Objects && this.pendingRecords.Objects.length > 0 ?
		this.renderTable() : html`<d2l-message-container message="${this.localize('noResultsFound')}"></d2l-message-container>`
}
			</div>
		`;
	}
}
customElements.define('d2l-cpd-pending-records', PendingRecords);