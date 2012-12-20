/// <reference path="../TableStreamReader.ts" />
module pe.managed.metadata {
	// There shall be no duplicate rows, based upon Parent
	// (a given class has only one 'pointer' to the start of its event list). [ERROR]
	// There shall be no duplicate rows, based upon EventList
	// (different classes cannot share rows in the TableKind.Event table). [ERROR]
	// [ECMA-335 para22.12]
	// Note that TableKind.EventMap info does not directly influence runtime behavior;
	// what counts is the information stored for each method that the event comprises.
	// The TableKind.EventMap and TableKind.Event tables result from putting the .event directive on a class (ECMA-335 para18).
	export class EventMap {
		// An index into the TableKind.TypeDef table.
		parent: number;

		// An index into the TableKind.Event table.
		// It marks the first of a contiguous run of Events owned by this Type.
		eventList: number;

		internalReadRow(reader: TableStreamReader): void {
			this.parent = reader.readTableRowIndex(TableKind.TypeDef);
			this.eventList = reader.readTableRowIndex(TableKind.Event);
		}
	}
}