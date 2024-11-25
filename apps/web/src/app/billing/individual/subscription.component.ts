import { Component, OnInit } from "@angular/core";
import { Observable, of, switchMap } from "rxjs";

import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

@Component({
  templateUrl: "subscription.component.html",
})
export class SubscriptionComponent implements OnInit {
  hasPremium$: Observable<boolean>;
  selfHosted: boolean;

  constructor(
    private platformUtilsService: PlatformUtilsService,
    billingAccountProfileStateService: BillingAccountProfileStateService,
    private accountService: AccountService,
  ) {
    this.hasPremium$ = this.accountService.activeAccount$.pipe(
      switchMap((account) =>
        account ? billingAccountProfileStateService.hasPremiumPersonally$(account.id) : of(false),
      ),
    );
  }

  ngOnInit() {
    this.selfHosted = this.platformUtilsService.isSelfHost();
  }
}
