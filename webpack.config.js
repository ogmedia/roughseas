const path = require('path');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: "development",
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  plugins: [
  	new CopyWebpackPlugin({
  		patterns: [
				{ "from": "src/textures", "to": "textures" },
			]
  	}),
  	new BundleAnalyzerPlugin(),
  ],
  // module: {
  // 	rules: [
  // 		{
  // 			test: /\.(png|jpe?g|gif)$/i,
  // 			loader: 'file-loader',
		// 		options: {
  //         name: '/textures/[name].[ext]',
	 //      },
  // 		}
  // 	],
  // },
};