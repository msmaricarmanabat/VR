import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { VRApiService } from '../services/VRApiService'
import { IInstrumentField } from '../models/IInstrumentField';
import { AuthenticationService } from '../services/AuthenticationService';
import { ICompareSettings } from '../models/CompareSettings';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;

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
            instrumentFields: []
        } as ICompareSettings;
    }

    ngOnInit() {
       this.blockUI.start();
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
            return target && target.instrumentFields.length === originalDeal.fields.length;
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
                const included = !!target.instrumentFields.find(f => f === field);
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
            target.instrumentFields = this.allFieldsAreChecked ? [...originalDeal.fields] : [];
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
            const field = setting.instrumentFields.find(f => f === target);
            if (!field) {
                setting.instrumentFields.push(target);
            }
            this.allFieldsAreChecked = this.areDealFieldsAllIncluded();
        } else {
            const field = setting.instrumentFields.find(f => f === target);
            if (field) {
                setting.instrumentFields = setting.instrumentFields.filter(f => f !== target);
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
            target.instrumentFields = [];
        }
        this.allFieldsAreChecked = false;
    }

    logout() {
        this.authService.logout();
    }

    submit() {
       this.blockUI.start();
        this.settings.instrumentFields = this.instrumentSettings
            .filter(i => i.isChecked)
            .map((i) => {
                return { fields: i.instrumentFields, instrumentType: i.instrumentType } as IInstrumentField;
            });
        if (!this.settings.instrumentFields.length) {
            return;
        }
        this.vrApi.exportDeals(this.settings).subscribe((b) => {
            this.handleExportResponse(b);    
            this.blockUI.stop();
          }
        );
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
                    return { isChecked: false, instrumentType: deal.instrumentType, instrumentFields: [] } as IInstrumentSettings;
                })

                this.selectDeal(this.instrumentSettings[0]);
                this.blockUI.stop();
            });
    }

    isEnabled() {
      return this.instrumentSettings.some(c => c.isChecked === true);
    }

    handleExportResponse(blob: Blob): void {
        // It is necessary to create a new blob object with mime-type explicitly set
        // otherwise only Chrome works like it should
        const newBlob = new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // IE doesn't allow using a blob object directly as link href
        // instead it is necessary to use msSaveOrOpenBlob
        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(newBlob);
            return;
        }

        // For other browsers: 
        // Create a link pointing to the ObjectURL containing the blob.
        const data = window.URL.createObjectURL(newBlob);

        const link = document.createElement('a');
        link.href = data;
        link.download = 'instruments.xls';
        // this is necessary as link.click() does not work on the latest firefox
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

        setTimeout(() => {
            // For Firefox it is necessary to delay revoking the ObjectURL
            window.URL.revokeObjectURL(data);
            link.remove();
        }, 100);
    }
}

export interface IInstrumentSettings {
    isChecked: boolean;
    instrumentType: string;
    instrumentFields: string[];
}
