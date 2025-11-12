import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	
	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter()
	},

	// Suppress unused CSS selector warnings for universal theme/global styles
	// app.scss contains styles used across multiple pages, so some selectors
	// won't be used on every page - this is intentional
	onwarn: (warning, handler) => {
		if (warning.code === 'css_unused_selector') {
			return;
		}
		handler(warning);
	}
};

export default config;
