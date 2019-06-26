import { IInstrumentField } from "./IInstrumentField";

export interface ICompareSettings {
    startDate: Date;
    endDate: Date;
    deals: IInstrumentField[];
}