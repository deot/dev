import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

const useReactTogether = process.env.USE_REACT;

// 当库里同时含有vue和react，vue的jsx要含前缀vue
export default defineConfig({
	plugins: [
		vue(),
		vueJsx({
			include: /* istanbul ignore next -- @preserve */ useReactTogether ? /\.vue\.[jt]sx$/ : /\.[jt]sx$/
		})
	]
});
