import { Observable } from "rxjs";

import { UserId } from "../../../types/guid";

export type BillingAccountProfile = {
  hasPremiumPersonally: boolean;
  hasPremiumFromAnyOrganization: boolean;
};

export abstract class BillingAccountProfileStateService {
  /**
   * Gets the premium status from organizations for a specific user
   * @param userId The user to get the premium status for
   */
  abstract hasPremiumFromAnyOrganization$(userId: UserId): Observable<boolean>;

  /**
   * Gets the personal premium status for a specific user
   * @param userId The user to get the premium status for
   */
  abstract hasPremiumPersonally$(userId: UserId): Observable<boolean>;

  /**
   * Gets whether the user has premium from any source for a specific user
   * @param userId The user to get the premium status for
   */
  abstract hasPremiumFromAnySource$(userId: UserId): Observable<boolean>;

  /**
   * Sets the user's premium status fields upon every full sync, either from their personal
   * subscription to premium, or an organization they're a part of that grants them premium.
   * @param hasPremiumPersonally Whether the user has premium personally
   * @param hasPremiumFromAnyOrganization Whether the user has premium from any organization
   * @param userId The user to set the premium status for
   */
  abstract setHasPremium(
    hasPremiumPersonally: boolean,
    hasPremiumFromAnyOrganization: boolean,
    userId: UserId,
  ): Promise<void>;
}
