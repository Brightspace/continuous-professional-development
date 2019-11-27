import '@brightspace-ui/core/components/icons/icon.js';
import { css, html, LitElement } from 'lit-element/lit-element.js';
import { LocalizeMixin } from '@brightspace-ui/core/mixins/localize-mixin.js';
import { selectStyles } from '@brightspace-ui/core/components/inputs/input-select-styles.js';

class PageSelect extends LocalizeMixin(LitElement) {

	static get properties() {
		return {
			pages: {
				type: Number
			},
			page: {
				type: Number
			}
		};
	}

	static get styles() {
		return [
			selectStyles,
			css`
			.hide {
				visibility: hidden;
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

		this.pages = 0;
		this.page = 1;
	}

	firePageSelectUpdated() {
		const event = new CustomEvent('d2l-page-select-updated', {
			detail: {
				page: this.page
			}
		});
		this.dispatchEvent(event);
	}

	serializePageOptions(totalPages) {
		const templates = [];
		for (let i = 1; i <= totalPages; i++) {
			templates.push(html`<option value="${i}">${i} of ${totalPages}</option>`);
		}
		return templates;
	}

	setPage(e) {
		this.page = e.target.value;
		this.firePageSelectUpdated();
	}

	incrementPage() {
		this.page++;
		const select = this.shadowRoot.querySelector('#page-select');
		select.options[++select.selectedIndex].selected = true;
		this.firePageSelectUpdated();
	}

	decrementPage() {
		this.page--;
		const select = this.shadowRoot.querySelector('#page-select');
		select.options[--select.selectedIndex].selected = true;
		this.firePageSelectUpdated();
	}

	render() {
		return html`
			<d2l-icon 
				class="${this.page > 1 ? null : 'hide'}"
				icon="tier1:chevron-left" 
				@click="${this.decrementPage}"
				>
			</d2l-icon>
			<select 
				id="page-select"
				class="d2l-input-select" 
				@change="${this.setPage}"
				>
				${this.serializePageOptions(this.pages)}
			</select>
			<d2l-icon 
				class="${this.page < this.pages ? null : 'hide'}"
				icon="tier1:chevron-right" 
				@click="${this.incrementPage}"
				>
			</d2l-icon>
		`;
	}
}
customElements.define('d2l-page-select', PageSelect);