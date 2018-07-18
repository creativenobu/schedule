import * as $ from 'jquery';
import UiComponent from './UiComponent';

export default class FailedScheduleLoad implements UiComponent {
    appendTo(entry: JQuery<HTMLElement>): void {
        // TODO(#55): FailedScheduleLoad component is not implemented
        entry.append($(`<div>Failed to load schedule data. Keep refreshing.</div>`))
    }
}
