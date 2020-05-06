import '@brightspace-ui/core/components/button/button-icon';
import '@brightspace-ui/core/components/icons/icon';
import '@brightspace-ui/core/components/inputs/input-date';
import '@brightspace-ui/core/components/inputs/input-search';
import '@brightspace-ui/core/components/link/link';
import '@brightspace-ui/core/components/dropdown/dropdown';
import '@brightspace-ui/core/components/dropdown/dropdown-menu';
import '@brightspace-ui/core/components/menu/menu';
import '@brightspace-ui/core/components/menu/menu-item';
import '@brightspace-ui-labs/view-toggle/view-toggle';
import './message-container';
import './page-select';
import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin';
import { CpdServiceFactory } from '../services/cpd-service-factory';
import { cpdSharedStyles } from '../styles/cpd-shared-styles';
import { cpdTableStyles } from '../styles/cpd-table-styles';
import { formatDate } from '@brightspace-ui/intl/lib/dateTime';

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
			cpdSharedStyles,
			cpdTableStyles,
			css`
			#host {
				min-height: 650px;
			}

			div[role=main] {
				display: grid;
				grid-gap: 1rem;
			}

			.icon_column {
				width: 30px;
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
		this.filters = {};
	}

	connectedCallback() {
		super.connectedCallback();

		this.cpdService.getPendingRecords(this.page)
			.then(data => {
				this.pendingRecords = data;
			});

		this.cpdService.getSubjects()
			.then(body => {
				this.subjects = body.reduce((d, v) => (d[v.Id] = v.Name, d), {});
			});

		this.cpdService.getMethods()
			.then(body => {
				this.methods = body.reduce((d, v) => (d[v.Id] = v.Name, d), {});
			});
	}

	fetchAwards() {
		this.cpdService.getPendingRecords(this.page, this.filters)
			.then(data => {
				this.pendingRecords = data;
			});
	}

	updateFilter(e) {
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
			case 'view_toggle':
				this.filters.Dismissed = e.detail.view === 'dismissed';
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
		if (this.filters.Dismissed) {
			this.cpdService.restoreRecord(JSON.parse(awardData).IssuedAwardId);
		}
		this.fireNavigationEvent({
			page: 'cpd-add-record',
			awardData
		});
	}

	dismissRecordButtonClicked(e) {
		const awardData = JSON.parse(e.target.getAttribute('data-award-id'));
		if (this.filters.Dismissed) {
			this.cpdService.restoreRecord(awardData.IssuedAwardId);
		}
		else {
			this.cpdService.dismissRecord(awardData.IssuedAwardId);
		}
		this.fetchAwards();
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
					<th>
						${this.localize('subject')}
					</th>
					<th>
						${this.localize('method')}
					</th>
				</tr>
			</thead>

			<tbody>
				${this.pendingRecords && this.pendingRecords.Objects.map(award => this.renderAward(award))}
			</tbody>
		</table>

		<div class="pageControl">
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
								<d2l-menu-item
									data-award-id="${JSON.stringify(award)}"
									text="${this.localize(this.filters.Dismissed ? 'restoreRecord' : 'dismissRecord')}"
									@click="${this.dismissRecordButtonClicked}">
								</d2l-menu-item>
							</d2l-menu>
						</d2l-dropdown-menu>
					</d2l-dropdown>
				</td>
				<td>
					${formatDate(new Date(award.IssuedDate))}
				</td>
				<td>${this.subjects && this.subjects[award.SubjectId]}
				</td>
				<td>${this.methods && this.methods[award.MethodId]}
				</td>
			</tr>
		`;
	}

	render() {
		const toggleOptions = [
			{
				text: this.localize('pendingRecords'),
				val: 'pending'
			},
			{
				text: this.localize('dismissedRecords'),
				val: 'dismissed'
			}
		];
		return html`
			<div id="host">
				<div role="main">
					<d2l-view-toggle id="view_toggle" .toggleOptions=${toggleOptions} selectedOption="pending" @d2l-view-toggle-changed="${this.updateFilter}"></d2l-view-toggle>
					<div class="searchContainer">
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

				${ this.pendingRecords && this.pendingRecords.Objects && this.pendingRecords.Objects.length > 0 ?
		this.renderTable() : html`<d2l-message-container message="${this.localize('noResultsFound')}"></d2l-message-container>`
}
				</div>
			</div>
		`;
	}
}
customElements.define('d2l-cpd-pending-records', PendingRecords);
