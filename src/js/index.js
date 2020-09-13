import '../scss/main.scss'
import { Canvas } from './canvas';
import { MDCSlider } from '@material/slider';

const wrapper = document.querySelector('#canvas');
const color = document.querySelector('#color');
const slider = new MDCSlider(document.querySelector('#slider'));

const options = {
	size: {
		x: 300,
		y: 800
	},
	wrapper,
	slider,
	color
};
const canvas = new Canvas(options);

canvas.init();