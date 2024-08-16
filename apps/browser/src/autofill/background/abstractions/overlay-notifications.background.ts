import AutofillPageDetails from "../../models/autofill-page-details";

export type WebsiteOriginsWithFields = Map<chrome.tabs.Tab["id"], string>;

export type ActiveFormSubmissionRequests = Set<chrome.webRequest.ResourceRequest["requestId"]>;

export type ModifyLoginCipherFormData = Map<
  chrome.tabs.Tab["id"],
  { uri: string; username: string; password: string; newPassword: string }
>;

export type OverlayNotificationsExtensionMessage = {
  command: string;
  uri?: string;
  username?: string;
  password?: string;
  newPassword?: string;
  details?: AutofillPageDetails;
};

type OverlayNotificationsMessageParams = { message: OverlayNotificationsExtensionMessage };
type OverlayNotificationSenderParams = { sender: chrome.runtime.MessageSender };
type OverlayNotificationsMessageHandlersParams = OverlayNotificationsMessageParams &
  OverlayNotificationSenderParams;

export type OverlayNotificationsExtensionMessageHandlers = {
  [key: string]: ({ message, sender }: OverlayNotificationsMessageHandlersParams) => any;
  formFieldSubmitted: ({ message, sender }: OverlayNotificationsMessageHandlersParams) => void;
  collectPageDetailsResponse: ({
    message,
    sender,
  }: OverlayNotificationsMessageHandlersParams) => Promise<void>;
};

export interface OverlayNotificationsBackground {
  init(): void;
}
