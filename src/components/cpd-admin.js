
import '@brightspace-ui/core/components/tabs/tabs';
import './cpd-admin-job-list';
import './cpd-manage-targets';
import './cpd-admin-items';
import { css, html, LitElement } from 'lit-element/lit-element';
import { BaseMixin } from '../mixins/base-mixin';

class CpdAdmin extends BaseMixin(LitElement) {
	static get properties() {
		return {
			context: {
				type: Object
			},
			pageData: {
				type: Object
			}
		};
	}
	static get styles() {
		return css``;
	}
	connectedCallback() {
		super.connectedCallback();
		this.addEventListener('d2l-cpd-navigate', this.handleNavigateEvent);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener('d2l-cpd-navigate', this.handleNavigateEvent);
	}
	handleNavigateEvent(e) {
		this.pageData = e.detail.pageData;
	}
	render() {
		if (this.pageData && this.pageData.page === 'cpd-manage-targets') {
			return html`<d2l-cpd-manage-targets .jobTitle="${this.pageData.jobTitle}"></d2l-cpd-manage-targets>`;
		}
		const methodContext = {
			placeholderText: this.localize('methodNamePlaceholder'),
			inputLabel: this.localize('methodName'),
			addButtonText: this.localize('addMethod'),
			dialogTitleEdit: this.localize('editMethod'),
			dialogTitleAdd: this.localize('addMethod'),
			textFieldName: 'Name',
			type: 'method'
		};
		const subjectContext = {
			placeholderText: this.localize('subjectNamePlaceholder'),
			inputLabel: this.localize('subjectName'),
			addButtonText: this.localize('addSubject'),
			dialogTitleEdit: this.localize('editSubject'),
			dialogTitleAdd: this.localize('addSubject'),
			textFieldName: 'Name',
			type: 'subject'
		};
		const questionContext = {
			placeholderText: this.localize('questionNamePlaceholder'),
			inputLabel: this.localize('questionName'),
			addButtonText: this.localize('addQuestion'),
			dialogTitleEdit: this.localize('editQuestion'),
			dialogTitleAdd: this.localize('addQuestion'),
			textFieldName: 'QuestionText',
			type: 'question'
		};
		return html`
		<d2l-tabs>
			${this.context && this.context.admin ? html`
				<d2l-tab-panel
					text="${this.localize('jobTitleTargets')}">
					<d2l-cpd-admin-job-list></d2l-cpd-admin-job-list>
				</d2l-tab-panel>` : html``}
			${this.context && this.context.metadata ? html`
			<d2l-tab-panel
				text="${this.localize('manageSubjects')}">
				<d2l-cpd-admin-items .context="${subjectContext}"></d2l-cpd-admin-items>
			</d2l-tab-panel>
			<d2l-tab-panel
				text="${this.localize('manageMethods')}">
				<d2l-cpd-admin-items .context="${methodContext}"></d2l-cpd-admin-items>
			</d2l-tab-panel>
			<d2l-tab-panel
				text="${this.localize('manageQuestions')}">
				<d2l-cpd-admin-items .context="${questionContext}"></d2l-cpd-admin-items>
			</d2l-tab-panel>` : html``}
		</d2l-tabs>`;
	}
}
customElements.define('d2l-cpd-admin', CpdAdmin);
