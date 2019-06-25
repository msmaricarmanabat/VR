import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  interestFormGroup: FormGroup
  deals: string[];
  loanDepositFields: string[];
  selected: any;
  selectedDeal: string;
  ccrisFields: string[];
  fields: string[];

  constructor(private formBuilder: FormBuilder, private router: Router){}
  

  ngOnInit() {
    this.interestFormGroup = this.formBuilder.group({
      deals: this.formBuilder.array([])
    });

    setTimeout((res) => {
      this.deals = ['Loan Deposit', 'CCRIS'];
      this.selectedDeal = 'Loan Deposit';
      this.loanDepositFields = ['Counterparty', 'CounterpartyId', 'BussinessUnit', 'ID', 'Status', 'Name',
        'Other Ref', 'Type', 'Product', 'Cash Flow Type', 'Actua/Forecast', 'Depository Ref',
        'ISIN / CUSIP', 'Security', 'Issuer', 'Counterparty Group', 'Broker', 'Provider',
        'Beneficiary', 'Deal Group', 'GL Category', 'Liquidity Code', 'Balance Sheet Code', 'Ccy', 'Amount',
        'Base Amount', 'Issue Date', 'Deal', 'Start', 'Term', 'End',
        'Flow', 'Rate', 'Frequency', 'Capitalising', 'Auto-Roll', 'Provider',
        'Custom Schedule', 'Facility', 'Tranche', 'Repo Eligible', 'Option Status', 'Mirrored Deal'
      ];

      this.ccrisFields = [
        'Flow', 'Rate', 'Frequency', 'Capitalising', 'Auto-Roll', 'Provider',
        'Custom Schedule', 'Facility', 'Tranche', 'Repo Eligible', 'Option Status', 'Mirrored Deal'
      ];
      this.fields = this.loanDepositFields.sort();
    });

  }

  onChange(event) {
    const interests = <FormArray>this.interestFormGroup.get('interests') as FormArray;

    if (event.checked) {
      interests.push(new FormControl(event.source.value))
    } else {
      const i = interests.controls.findIndex(x => x.value === event.source.value);
      interests.removeAt(i);
    }
  }

  logout() {
    this.router.navigate(["login"]);
  }

  submit() {
    console.log(this.interestFormGroup.value);
  }

  selectDeal(deal: string) {
    this.selectedDeal = deal;
    if (deal === 'Loan Deposit') {
      this.fields = this.loanDepositFields.sort();
    } else {
      this.fields = this.ccrisFields.sort();
    }
  }
}
