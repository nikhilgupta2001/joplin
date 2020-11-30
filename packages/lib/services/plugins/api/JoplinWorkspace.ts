import { ModelType } from '../../../BaseModel';
import eventManager from '../../../eventManager';
import makeListener from '../utils/makeListener';
import { Disposable } from './types';

/**
 * @ignore
 */
const Note = require('../../../models/Note');

enum ItemChangeEventType {
	Create = 1,
	Update = 2,
	Delete = 3,
}

interface ItemChangeEvent {
	id: string;
	event: ItemChangeEventType;
}

type ItemChangeHandler = (event:ItemChangeEvent) => void;

/**
 * The workspace service provides access to all the parts of Joplin that are being worked on - i.e. the currently selected notes or notebooks as well
 * as various related events, such as when a new note is selected, or when the note content changes.
 *
 * [View the demo plugin](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
 */
export default class JoplinWorkspace {
	// TODO: unregister events when plugin is closed or disabled

	private store: any;
	// private implementation_:any;

	constructor(_implementation: any, store: any) {
		this.store = store;
		// this.implementation_ = implementation;
	}

	/**
	 * Called when a new note or notes are selected.
	 */
	async onNoteSelectionChange(callback: Function) {
		eventManager.appStateOn('selectedNoteIds', callback);
	}

	/**
	 * Called when the content of a note changes.
	 * @deprecated Use `onNoteChange()` instead, which is reliably triggered whenever the note content, or any note property changes.
	 */
	async onNoteContentChange(callback: Function) {
		eventManager.on('noteContentChange', callback);
	}

	/**
	 * Called when the content of a note changes.
	 */
	async onNoteChange(handler:ItemChangeHandler):Promise<Disposable> {
		return makeListener(eventManager, 'itemName', (event:any) => {
			if (event.itemType !== ModelType.Note) return;
			
			handler({
				id: event.itemId,
				event: event.eventType,
			});
		});
	}

	/**
	 * Called when an alarm associated with a to-do is triggered.
	 */
	async onNoteAlarmTrigger(callback: Function) {
		eventManager.on('noteAlarmTrigger', callback);
	}

	/**
	 * Called when the synchronisation process has finished.
	 */
	async onSyncComplete(callback: Function) {
		eventManager.on('syncComplete', callback);
	}

	/**
	 * Gets the currently selected note
	 */
	async selectedNote(): Promise<any> {
		const noteIds = this.store.getState().selectedNoteIds;
		if (noteIds.length !== 1) { return null; }
		return Note.load(noteIds[0]);
	}

	/**
	 * Gets the IDs of the selected notes (can be zero, one, or many). Use the data API to retrieve information about these notes.
	 */
	async selectedNoteIds(): Promise<string[]> {
		return this.store.getState().selectedNoteIds.slice();
	}
}
