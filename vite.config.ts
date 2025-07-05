import type { UserConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"
import solidPlugin from "vite-plugin-solid"

export default {
	plugins: [ solidPlugin(), viteSingleFile() ],
	server: { port: 3000 },
	build: { target: "esnext" }
} satisfies UserConfig
