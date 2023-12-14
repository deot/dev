export default {
	plugins: ['stylelint-order', 'stylelint-codeguide'],
	extends: ['stylelint-config-standard-scss'],
	rules: {
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: ['global'],
			}
		],
		'at-rule-no-unknown': [
			true,
			{
				ignoreAtRules: [
					'use',
					'for',
					'function',
					'if',
					'each',
					'include',
					'mixin',
					'at-root',
					'else',
					'extend',
					'return',
					'debug',
					'while'
				],
			}
		],
		'no-empty-source': null,
		'named-grid-areas-no-invalid': null,
		'no-descending-specificity': null,
		'font-family-no-missing-generic-family-keyword': null,
		'rule-empty-line-before': [
			'always',
			{
				ignore: ['after-comment', 'first-nested'],
			}
		],
		'function-no-unknown': null,
		'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],

		// stylistic
		'codeguide/indentation': 'tab',
		'codeguide/declaration-colon-space-after': 'always-single-line',
		'codeguide/declaration-colon-space-before': 'never',
		'codeguide/declaration-block-trailing-semicolon': 'always',

		// Specify the alphabetical order of the attributes in the declaration block
		'order/properties-order': [
			'position',
			'top',
			'right',
			'bottom',
			'left',
			'z-index',
			'display',
			'float',
			'width',
			'height',
			'max-width',
			'max-height',
			'min-width',
			'min-height',
			'padding',
			'padding-top',
			'padding-right',
			'padding-bottom',
			'padding-left',
			'margin',
			'margin-top',
			'margin-right',
			'margin-bottom',
			'margin-left',
			'margin-collapse',
			'margin-top-collapse',
			'margin-right-collapse',
			'margin-bottom-collapse',
			'margin-left-collapse',
			'overflow',
			'overflow-x',
			'overflow-y',
			'clip',
			'clear',
			'font',
			'font-family',
			'font-size',
			'font-smoothing',
			'osx-font-smoothing',
			'font-style',
			'font-weight',
			'hyphens',
			'src',
			'line-height',
			'letter-spacing',
			'word-spacing',
			'color',
			'text-align',
			'text-decoration',
			'text-indent',
			'text-overflow',
			'text-rendering',
			'text-size-adjust',
			'text-shadow',
			'text-transform',
			'word-break',
			'word-wrap',
			'white-space',
			'vertical-align',
			'list-style',
			'list-style-type',
			'list-style-position',
			'list-style-image',
			'pointer-events',
			'cursor',
			'background',
			'background-attachment',
			'background-color',
			'background-image',
			'background-position',
			'background-repeat',
			'background-size',
			'border',
			'border-collapse',
			'border-top',
			'border-right',
			'border-bottom',
			'border-left',
			'border-color',
			'border-image',
			'border-top-color',
			'border-right-color',
			'border-bottom-color',
			'border-left-color',
			'border-spacing',
			'border-style',
			'border-top-style',
			'border-right-style',
			'border-bottom-style',
			'border-left-style',
			'border-width',
			'border-top-width',
			'border-right-width',
			'border-bottom-width',
			'border-left-width',
			'border-radius',
			'border-top-right-radius',
			'border-bottom-right-radius',
			'border-bottom-left-radius',
			'border-top-left-radius',
			'border-radius-topright',
			'border-radius-bottomright',
			'border-radius-bottomleft',
			'border-radius-topleft',
			'content',
			'quotes',
			'outline',
			'outline-offset',
			'opacity',
			'filter',
			'visibility',
			'size',
			'zoom',
			'transform',
			'box-align',
			'box-flex',
			'box-orient',
			'box-pack',
			'box-shadow',
			'box-sizing',
			'table-layout',
			'animation',
			'animation-delay',
			'animation-duration',
			'animation-iteration-count',
			'animation-name',
			'animation-play-state',
			'animation-timing-function',
			'animation-fill-mode',
			'transition',
			'transition-delay',
			'transition-duration',
			'transition-property',
			'transition-timing-function',
			'background-clip',
			'backface-visibility',
			'resize',
			'appearance',
			'user-select',
			'interpolation-mode',
			'direction',
			'marks',
			'page',
			'set-link-source',
			'unicode-bidi',
			'speak'
		],
	},
	ignoreFiles: [
		'**/node_modules/**',
		'**/dist/**',
		'**/temp/**',
		'**/tmp/**',
		'**/coverage/**',
		'**/*.js',
		'**/*.ts',
		'**/*.tsx',
		'**/*.jsx'
	]
};
