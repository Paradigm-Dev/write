module.exports = {
	transpileDependencies: ['vuetify'],
	pluginOptions: {
		electronBuilder: {
			outputDir: 'dist',
			removeElectronJunk: true,
			nodeIntegration: true,
			builderOptions: {
				productName: 'Write',
				mac: {
					darkModeSupport: true
				},
				dmg: {
					artifactName: 'Write-v${version}.${ext}',
					title: 'Write'
				},
				nsis: {
					artifactName: 'Write-v${version}.${ext}',
					deleteAppDataOnUninstall: true,
					shortcutName: 'Write',
					uninstallDisplayName: 'Write'
				}
			}
		}
	},
	devServer: {
		https: false,
		proxy: {
			'^/api': {
				target: 'https://www.theparadigmdev.com',
				changeOrigin: true,
				ws: true,
				cookieDomainRewrite: {
					'*': ''
				}
			}
		}
	}
};
