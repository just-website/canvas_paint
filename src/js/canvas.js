import { fromEvent, interval, Observable } from 'rxjs';
import { map, pairwise, switchMap, takeUntil, withLatestFrom, tap, throttleTime, startWith, shareReplay } from 'rxjs/operators';

class Canvas {
	constructor(options) {
		this.wrapper = options.wrapper;
		this.size = {
			x: options.sizeX || this.wrapper.clientHeight,
			y: options.sizeY || this.wrapper.clientWidth
		};
		this.wrapper.setAttribute('width', this.size.y);
		this.wrapper.setAttribute('height', this.size.x);
		this.context = this.wrapper.getContext('2d');
		
		this.color$ = fromEvent(options.color, 'change')
			.pipe(
				map(event => event.target.value),
				startWith('#000'),
				shareReplay(1)
			);

		this.slider$ = new Observable( observer => {
			options.slider.listen('MDCSlider:change', () => {
				observer.next(options.slider.value)
			})
		}).pipe(
			startWith(options.slider.value),
			shareReplay(1)
		);

		this.mouseUp$ = fromEvent(this.wrapper, 'mouseup')
			.pipe(
				map((event) => ({ x: event.offsetX, y: event.offsetY }))
			);

		this.mouoseOut$ = fromEvent(this.wrapper, 'mouseout');

		this.mouseMove$ = fromEvent(this.wrapper, 'mousemove')
			.pipe(
				throttleTime(10),
				withLatestFrom(this.slider$, this.color$),
				map(([event, width, color]) => ({ x: event.offsetX, y: event.offsetY, width, color })),
				pairwise(),
				takeUntil(this.mouseUp$),
				takeUntil(this.mouoseOut$)
			);

		this.mouseDown$ = fromEvent(this.wrapper, 'mousedown')
			.pipe(
				switchMap(() => this.mouseMove$),
			);

		this.resize$ = fromEvent(window, 'resize')
			.pipe(
				throttleTime(30)
			)

	}

	init() {
		this.mouseDown$.subscribe(([from, to]) => {
			this.drawLine({
				context: this.context,
				from,
				to
			})
		});

		this.resize$.subscribe( (event) => {
			this.wrapper.setAttribute('width', this.wrapper.clientWidth);
			this.wrapper.setAttribute('height', this.wrapper.clientHeight);
		})
	}

	drawLine({ context, from, to }) {
		context.beginPath();
		context.moveTo(from.x, from.y);
		context.lineTo(to.x, to.y);
		context.closePath();
		context.lineWidth = to.width || 2;
		context.strokeStyle = to.color || 'black';
		context.stroke();
	}

	clear() {
		this.context.clearRect(0, 0, this.size.y, this.size.x);
	}
}

export { Canvas };