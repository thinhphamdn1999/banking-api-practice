import type React from 'react';
import type { Breakpoints } from '@mui/material/styles';

// ---------------------------------------------------------------------------
// TypeScript module augmentations
// Extends MUI's built-in types so custom variants work with <Typography variant="...">
// ---------------------------------------------------------------------------

declare module '@mui/material/styles' {
	interface TypographyVariants {
		title_large: React.CSSProperties;
		title_medium: React.CSSProperties;
		title_small: React.CSSProperties;
		body_largeBold: React.CSSProperties;
		body_largeRegular: React.CSSProperties;
		body_mediumBold: React.CSSProperties;
		body_mediumRegular: React.CSSProperties;
		body_smallBold: React.CSSProperties;
		body_smallRegular: React.CSSProperties;
		label_large: React.CSSProperties;
		label_small: React.CSSProperties;
	}

	interface TypographyVariantsOptions {
		title_large?: React.CSSProperties;
		title_medium?: React.CSSProperties;
		title_small?: React.CSSProperties;
		body_largeBold?: React.CSSProperties;
		body_largeRegular?: React.CSSProperties;
		body_mediumBold?: React.CSSProperties;
		body_mediumRegular?: React.CSSProperties;
		body_smallBold?: React.CSSProperties;
		body_smallRegular?: React.CSSProperties;
		label_large?: React.CSSProperties;
		label_small?: React.CSSProperties;
	}
}

declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		title_large: true;
		title_medium: true;
		title_small: true;
		body_largeBold: true;
		body_largeRegular: true;
		body_mediumBold: true;
		body_mediumRegular: true;
		body_smallBold: true;
		body_smallRegular: true;
		label_large: true;
		label_small: true;
	}
}

// ---------------------------------------------------------------------------
// Typography variants factory
// Receives breakpoints from the assembled theme so media queries are consistent.
// ---------------------------------------------------------------------------

export const createTypographyVariants = (breakpoints: Breakpoints) => ({
	// --- Titles ---

	// Page-level hero title
	title_large: {
		fontSize: '1.75rem',
		fontWeight: 700,
		letterSpacing: '-0.0625rem',
		lineHeight: '2.25rem',
		[breakpoints.up('md')]: {
			fontSize: '3rem',
			lineHeight: '3.625rem',
		},
	},

	// Section title
	title_medium: {
		fontSize: '1.5rem',
		fontWeight: 600,
		letterSpacing: '-0.0625rem',
		lineHeight: '1.75rem',
		[breakpoints.up('md')]: {
			fontSize: '2.25rem',
			lineHeight: '2.75rem',
		},
	},

	// Sub-section title / card title
	title_small: {
		fontSize: '1.25rem',
		fontWeight: 600,
		letterSpacing: '-0.03125rem',
		lineHeight: '1.5rem',
		[breakpoints.up('md')]: {
			fontSize: '1.75rem',
			lineHeight: '2.25rem',
		},
	},

	// --- Body ---

	// Primary body text, bold — important info, highlights
	body_largeBold: {
		fontSize: '1rem',
		fontWeight: 600,
		lineHeight: '1.5rem',
		[breakpoints.up('md')]: {
			fontSize: '1.25rem',
			lineHeight: '1.875rem',
		},
	},

	// Primary body text, regular — descriptions, paragraphs
	body_largeRegular: {
		fontSize: '1rem',
		fontWeight: 400,
		lineHeight: '1.5rem',
		[breakpoints.up('md')]: {
			fontSize: '1.25rem',
			lineHeight: '1.875rem',
		},
	},

	// Secondary body text, bold — table data, list items
	body_mediumBold: {
		fontSize: '0.875rem',
		fontWeight: 600,
		lineHeight: '1.25rem',
		[breakpoints.up('md')]: {
			fontSize: '1rem',
			lineHeight: '1.5rem',
		},
	},

	// Secondary body text, regular — table data, list items
	body_mediumRegular: {
		fontSize: '0.875rem',
		fontWeight: 400,
		lineHeight: '1.25rem',
		[breakpoints.up('md')]: {
			fontSize: '1rem',
			lineHeight: '1.5rem',
		},
	},

	// Small body text, bold — chips, badges, status
	body_smallBold: {
		fontSize: '0.75rem',
		fontWeight: 600,
		lineHeight: '1rem',
		[breakpoints.up('md')]: {
			fontSize: '0.875rem',
			lineHeight: '1.25rem',
		},
	},

	// Small body text, regular — hints, secondary info
	body_smallRegular: {
		fontSize: '0.75rem',
		fontWeight: 400,
		lineHeight: '1rem',
		[breakpoints.up('md')]: {
			fontSize: '0.875rem',
			lineHeight: '1.25rem',
		},
	},

	// --- Labels ---

	// Form labels, column headers
	label_large: {
		fontSize: '0.875rem',
		fontWeight: 500,
		lineHeight: '1.25rem',
		letterSpacing: '0.00625rem',
		[breakpoints.up('md')]: {
			fontSize: '1rem',
			lineHeight: '1.5rem',
		},
	},

	// Helper text, captions, footnotes
	label_small: {
		fontSize: '0.75rem',
		fontWeight: 500,
		lineHeight: '1rem',
		letterSpacing: '0.025rem',
	},
});
