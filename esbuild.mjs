import { build } from "esbuild";

const baseConfig = {
	bundle: true,
	minify: process.env.NODE_ENV === "production",
	sourcemap: process.env.NODE_ENV !== "production",
	watch: process.argv.slice(2).includes("--watch") ? {
		onRebuild(error, result) {
			console.log("[watch] build started");
			if (error) {
				error.errors.forEach(error =>
					console.error(`> ${error.location.file}:${error.location.line}:${error.location.column}: error: ${error.text}`)
				);
			} else {
				console.log("[watch] build finished");
			}
		}
	} : undefined,
};

const extensionConfig = {
	...baseConfig,
	platform: "node",
	mainFields: ["module", "main"],
	format: "cjs",
	entryPoints: ["./src/extension.ts"],
	outfile: "./out/extension.js",
	external: ["vscode"],
};

const viewConfig = {
	...baseConfig,
	target: "es2020",
	format: "esm",
	entryPoints: ["./view/view.tsx"],
	outfile: "./out/view.js",
};

(async () => {
	try {
		await build(extensionConfig);
		await build(viewConfig);
		console.log("build complete");
	} catch (err) {
		process.stderr.write(err.stderr);
		process.exit(1);
	}
})();
