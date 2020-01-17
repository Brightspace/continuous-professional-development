import { css } from 'lit-element/lit-element.js';

export const cpdSharedStyles = css`
	d2l-date-picker {
		width: 138px;
	}

	.searchContainer {
		display: grid;
		column-gap: 12px;
		grid-auto-flow: column;
		align-items: baseline;
		width: min-content;
	}

	.dateFilterControls {
		display: grid;
		width: min-content;
		column-gap: 12px;
		grid-auto-flow: column;
		align-items: baseline;
		margin-top: 6px;
	}

	.pageControl {
		display: flex;
		justify-content: center;
	}

	d2l-input-search {
		width: 300px;
	}

`;
