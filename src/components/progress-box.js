import '@brightspace-ui/core/components/colors/colors';
import '@brightspace-ui/core/components/icons/icon';
import '@brightspace-ui-labs/view-toggle/view-toggle';
import './progress-overall';
import './progress-subject';
import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin';
import { CpdServiceFactory } from '../services/cpd-service-factory';

class CpdProgressBox extends BaseMixin(LitElement) {
	static get properties() {
		return {
			hasEnforcedTarget: {
				type: Boolean,
			},
			progress: {
				type: Object
			},
			selectedView: {
				type: String
			},
			viewUserId: {
				type: Number
			}
		};
	}
	static get styles() {
		return css`
			d2l-view-toggle {
				margin: 12px 0;
			}
			d2l-progress-subject {
				margin: 12px;
				display: block;
			}
			d2l-progress-overall {
				display: block;
			}
			.progress {
				background-color: var(--d2l-color-sylvite);
				border: 2px solid var(--d2l-color-gypsum);
				border-radius: 0.5em;
			}
			.progress-header {
				display: flex;
				align-items: center;
				justify-content: space-between;
			}
			.progress-header-link {
				padding: 0 10px;
			}

			@media (max-width: 929px) {
				.progress {
					width: 420px;
				}
			}

			`
		;
	}

	constructor() {
		super();
		this.selectedView = 'overall';
		this.cpdService = CpdServiceFactory.getCpdService();
		this.viewUserId = 0;
	}

	connectedCallback() {
		super.connectedCallback();
	}
	navigateAdjustTargets() {
		this.fireNavigationEvent({page:'cpd-manage-targets'});
	}

	viewToggleChanged(e) {
		this.selectedView = e.detail.view;
	}

	renderTargetLink() {
		if (!this.viewUserId && !this.hasEnforcedTarget) {
			return html`
				<div class="progress-header-link">
					<d2l-link @click="${this.navigateAdjustTargets}">${this.localize('adjustTargets')}</d2l-link>
				</div>
			`;
		}
		return html ``;
	}

	renderView(selectedView) {
		if (selectedView === 'overall') {
			return html`
			<d2l-progress-overall
			.progress="${this.progress}"
			></d2l-progress-overall>
			`;
		}
		else if (selectedView === 'subject') {
			return html`
			<d2l-progress-subject
			.progress="${this.progress}"
			></d2l-progress-subject>
			`;
		}
		return html``;
	}

	render() {
		if (!this.progress) {
			return html``;
		}
		const toggleOptions = [
			{
				text: this.localize('overallProgress'),
				val: 'overall'
			},
			{
				text: this.localize('subjectProgress'),
				val: 'subject'
			}
		];
		return html`
		<div class="progress" @d2l-view-toggle-changed=${this.viewToggleChanged}>
			<div class="progress-header">
				<div>
					<d2l-view-toggle .toggleOptions=${toggleOptions} selectedOption="overall"></d2l-view-toggle>
				</div>
				${this.renderTargetLink()}
			</div>
			${this.renderView(this.selectedView)}
		</div>
		`;
	}
}
customElements.define('d2l-cpd-progress-box', CpdProgressBox);
