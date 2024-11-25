import { Observable } from "rxjs";

import { UserId } from "../../../types/guid";

export type BillingAccountProfile = {
  hasPremiumPersonally: boolean;
  hasPremiumFromAnyOrganization: boolean;
};

export abstract class BillingAccountProfileStateService {
  /**
   * Emits `true` when the specified user's account has been granted premium from any of the
   * organizations it is a member of. Otherwise, emits `false`
   */
  abstract hasPremiumFromAnyOrganization$(userId: UserId): Observable<boolean>;

  /**
   * Emits `true` when the specified user's account has an active premium subscription at the
   * individual user level
   */
  abstract hasPremiumPersonally$(userId: UserId): Observable<boolean>;

  /**
   * Emits `true` when either `hasPremiumPersonally` or `hasPremiumFromAnyOrganization` is `true`
   */
  abstract hasPremiumFromAnySource$(userId: UserId): Observable<boolean>;

  /**
   * Sets the specified user's premium status fields upon every full sync, either from their personal
   * subscription to premium, or an organization they're a part of that grants them premium.
   */
  abstract setHasPremium(
    hasPremiumPersonally: boolean,
    hasPremiumFromAnyOrganization: boolean,
    userId: UserId,
  ): Promise<void>;
}
