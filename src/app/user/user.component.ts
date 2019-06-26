import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { VRApiService } from '../services/VRApiService'
import { IInstrumentField } from '../models/IInstrumentField';
import { AuthenticationService } from '../services/AuthenticationService';
import { ICompareSettings } from '../models/CompareSettings';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
    interestFormGroup: FormGroup;
    selectedDeal: IInstrumentSettings;
    settings: ICompareSettings;
    allDealsAreChecked: boolean;
    allFieldsAreChecked: boolean;
    originalDeals: IInstrumentField[];
    instrumentSettings: IInstrumentSettings[] = [];
    currentFields: string[] = [];

    constructor(private formBuilder: FormBuilder, private router: Router, private vrApi: VRApiService, private authService: AuthenticationService) {
        this.settings = {
            startDate: new Date(Date.now()),
            endDate: new Date(Date.now()),
            deals: []
        } as ICompareSettings;
    }

    ngOnInit() {
        this.interestFormGroup = this.formBuilder.group({
            deals: this.formBuilder.array([])
        });
        this.setDeals();
    }

    areDealsAllIncluded(): boolean {
        if (!this.instrumentSettings || !this.instrumentSettings.length) {
            return false;
        }
        const checkedDeals = this.instrumentSettings.filter(i => i.isChecked);
        return checkedDeals.length === this.instrumentSettings.length;
    }

    areDealFieldsAllIncluded(): boolean {
        if (this.selectedDeal) {
            const target = this.instrumentSettings.find(i => i.instrumentType === this.selectedDeal.instrumentType);
            const originalDeal = this.originalDeals.find(d => d.instrumentType === this.selectedDeal.instrumentType);
            return target && target.fields.length === originalDeal.fields.length;
        }
        return false;
    }

    isDealIncluded(deal: IInstrumentField): boolean {
        const included = !!this.instrumentSettings.find(i => i.instrumentType === deal.instrumentType && i.isChecked)
        return included;
    }

    isFieldIncluded(field: string): boolean {
        if (this.selectedDeal) {
            const target = this.instrumentSettings.find(i => i.instrumentType === this.selectedDeal.instrumentType);
            if (target) {
                const included = !!target.fields.find(f => f === field);
                return included;
            }
        }
        return false;
    }

    onSelectAllDealsChange(event) {
        if (!event) {
            return;
        }
        this.allDealsAreChecked = event.checked;
        this.instrumentSettings.forEach(i => i.isChecked = this.allDealsAreChecked);
    }

    onSelectAllDealFieldsChange(event) {
        if (!event) {
            return;
        }
        this.allFieldsAreChecked = event.checked;
        const target = this.instrumentSettings.find(i => i.instrumentType === this.selectedDeal.instrumentType);
        const originalDeal = this.originalDeals.find(d => d.instrumentType === this.selectedDeal.instrumentType)
        if (target) {
            target.fields = this.allFieldsAreChecked ? [...originalDeal.fields] : [];
        }
    }

    onDealCheckChange(event) {
        if (!event || !event.source) {
            return;
        }
        const target = event.source.value as IInstrumentSettings;
        target.isChecked = event.checked;
        if (target.isChecked) {
            this.allDealsAreChecked = this.areDealsAllIncluded();
        } else {
            this.allDealsAreChecked = false;
        }
    }

    onDealFieldCheckChange(event) {
        if (!event || !event.source) {
            return;
        }
        const target = event.source.value as string;
        const setting = this.instrumentSettings.find(i => i.instrumentType === this.selectedDeal.instrumentType);

        if (event.checked) {
            const field = setting.fields.find(f => f === target);
            if (!field) {
                setting.fields.push(target);
            }
            this.allFieldsAreChecked = this.areDealFieldsAllIncluded();
        } else {
            const field = setting.fields.find(f => f === target);
            if (field) {
                setting.fields = setting.fields.filter(f => f !== target);
            }
            this.allFieldsAreChecked = false;
        }
    }

    excludeAllDeals() {
        this.instrumentSettings.forEach(i => i.isChecked = false);
        this.allDealsAreChecked = false;
    }

    excludeAllDealFields() {
        const target = this.instrumentSettings.find(i => i.instrumentType === this.selectedDeal.instrumentType);
        if (target) {
            target.fields = [];
        }
        this.allFieldsAreChecked = false;
    }

    logout() {
        this.authService.logout();
    }

    submit() {
        this.settings.deals = this.instrumentSettings
            .filter(i => i.isChecked)
            .map((i) => {
                return { fields: i.fields, instrumentType: i.instrumentType } as IInstrumentField;
            });
        if (!this.settings.deals.length) {
            return;
        }
        this.vrApi.exportDeals(this.settings);
    }

    selectDeal(deal: IInstrumentSettings) {
        this.selectedDeal = deal;
        const originalDeal = this.originalDeals.find(d => d.instrumentType === deal.instrumentType);
        if (originalDeal) {
            this.currentFields = originalDeal ? originalDeal.fields : [];
        }
    }

    setDeals() {
        this.vrApi
            .getFields()
            .subscribe((deals: IInstrumentField[]) => {
                if (!deals) {
                    this.originalDeals = []
                    this.instrumentSettings = [];
                    return;
                }
                this.originalDeals = deals;
                this.instrumentSettings = deals.map((deal) => {
                    return { isChecked: false, instrumentType: deal.instrumentType, fields: [] } as IInstrumentSettings;
                })
            });
    }
}

export interface IInstrumentSettings {
    isChecked: boolean;
    instrumentType: string;
    fields: string[];
}
