import { IInstrumentField } from "./IInstrumentField";

export interface ICompareSettings {
    startDate: Date;
    endDate: Date;
    instrumentFields: IInstrumentField[];
}