const path = require('path');
const process = require('process');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MODE = {
	prod: process.env.MODE !== 'dev',
	dev: process.env.MODE === 'dev'
};

const filePath = (ext) => `main.${MODE.prod ? '[hash].' : ''}${ext}`; 

module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: './js/index.js',
	output: {
		filename: filePath('js'),
		path: path.resolve(__dirname, 'www')
	},
	resolve: {
		extensions: ['.js'],
		alias: {
			'@root': path.resolve(__dirname, 'src')
		}
	},
	devServer: {
		contentBase: path.join(__dirname, 'www/main.js'),
		compress: false,
		port: 9000,
		hot: true,
		open: false
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: 'index.html',
			minify: MODE.prod
		}),
		new CopyPlugin({
			patterns: [
				{ 
					from: path.resolve(__dirname, 'src/favicon.ico'), 
					to: path.resolve(__dirname, 'www') 
				}
			],
		}),
		new MiniCssExtractPlugin({
			filename: filePath('css')
		})
	],
	module: {
		rules: [
			{
				test: /\.s[ac]ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader',
				],
			},
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: [
							[
								'@babel/preset-env',
								{
									useBuiltIns: 'entry',
									targets: MODE.prod ? { ie: '11' } :  { chrome: '70' } 
								}
							]
						],
						plugins: [
							'@babel/plugin-transform-runtime'
						],
					},
				}
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				use: ['source-map-loader'],
			},
			// {
			// 	enforce: 'pre',
			// 	test: /\.m?js$/,
			// 	exclude: /(node_modules|bower_components)/,
			// 	use: {
			// 		loader: 'eslint-loader',
			// 		options: {
			// 			failOnError: false,
			// 		},
			// 	}
			// }
		]
	},
};