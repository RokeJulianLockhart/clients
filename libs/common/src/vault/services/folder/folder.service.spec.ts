// eslint-disable-next-line no-restricted-imports
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { mock } from "jest-mock-extended";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { TestUserState as TestActiveUserState } from "../../../../spec/test-active-user-state";
import { ActiveUserStateProvider } from "../../../platform/abstractions/active-user-state.provider";
import { CryptoService } from "../../../platform/abstractions/crypto.service";
import { EncryptService } from "../../../platform/abstractions/encrypt.service";
import { I18nService } from "../../../platform/abstractions/i18n.service";
import { EncString } from "../../../platform/models/domain/enc-string";
import { ContainerService } from "../../../platform/services/container.service";
import { DerivedActiveUserState } from "../../../platform/services/default-active-user-state.provider";
import { StateService } from "../../../platform/services/state.service";
import { CipherService } from "../../abstractions/cipher.service";
import { FolderData } from "../../models/data/folder.data";
import { Folder } from "../../models/domain/folder";
import { FolderView } from "../../models/view/folder.view";
import { FolderService } from "../../services/folder/folder.service";

describe("Folder Service", () => {
  let folderService: FolderService;

  let cryptoService: SubstituteOf<CryptoService>;
  let encryptService: SubstituteOf<EncryptService>;
  let i18nService: SubstituteOf<I18nService>;
  let cipherService: SubstituteOf<CipherService>;
  let stateService: SubstituteOf<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;
  const activeUserStateProvider = mock<ActiveUserStateProvider>();
  let activeUserState: TestActiveUserState<Record<string, FolderData>>;
  const derivedActiveUserState =
    mock<DerivedActiveUserState<Record<string, FolderData>, FolderView[]>>();
  let folderViews$: BehaviorSubject<FolderView[]>;

  beforeEach(() => {
    cryptoService = Substitute.for();
    encryptService = Substitute.for();
    i18nService = Substitute.for();
    cipherService = Substitute.for();
    stateService = Substitute.for();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    const initialState = {
      "1": folderData("1", "test"),
    };
    stateService.getEncryptedFolders().resolves(initialState);
    stateService.activeAccount$.returns(activeAccount);
    stateService.activeAccountUnlocked$.returns(activeAccountUnlocked);
    (window as any).bitwardenContainerService = new ContainerService(cryptoService, encryptService);

    activeUserState = new TestActiveUserState({});
    activeUserState.next(initialState);
    activeUserStateProvider.create.mockReturnValue(activeUserState);
    activeUserState.createDerived.mockReturnValue(derivedActiveUserState);

    folderViews$ = new BehaviorSubject([]);
    derivedActiveUserState.state$ = folderViews$;

    folderService = new FolderService(
      cryptoService,
      i18nService,
      cipherService,
      activeUserStateProvider,
      stateService
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    folderViews$.complete();
    activeUserState.complete();
  });

  test("encrypt", async () => {
    const model = new FolderView();
    model.id = "2";
    model.name = "Test Folder";

    cryptoService.encrypt(Arg.any()).resolves(new EncString("ENC"));
    cryptoService.decryptToUtf8(Arg.any()).resolves("DEC");

    const result = await folderService.encrypt(model);

    expect(result).toEqual({
      id: "2",
      name: {
        encryptedString: "ENC",
        encryptionType: 0,
      },
    });
  });

  describe("get", () => {
    it("returns the current state", async () => {
      const result = await folderService.get("1");

      expect(result).toEqual(folder("1", "test"));
    });

    it("returns a Folder object", async () => {
      const result = await folderService.get("1");

      expect(result).toBeInstanceOf(Folder);
    });

    it("returns null if not found", async () => {
      const result = await folderService.get("2");

      expect(result).toBe(null);
    });
  });

  test("upsert emits new folder$ array", async () => {
    await folderService.upsert(folderData("2", "test 2"));

    expect(await firstValueFrom(folderService.folders$)).toEqual([
      folder("1", "test"),
      folder("2", "test 2"),
    ]);
  });
  test("replace", async () => {
    await folderService.replace({ "2": folderData("2", "test 2") });

    expect(await firstValueFrom(folderService.folders$)).toEqual([
      {
        id: "2",
        name: {
          decryptedValue: [],
          encryptedString: "test 2",
          encryptionType: 0,
        },
        revisionDate: null,
      },
    ]);
  });

  test("delete", async () => {
    await folderService.delete("1");

    expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
  });

  test("clearCache", async () => {
    await folderService.clearCache();

    expect((await firstValueFrom(folderService.folders$)).length).toBe(1);
    expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
  });

  test("clear nulls folders", async () => {
    await folderService.clear();

    expect(await firstValueFrom(folderService.folders$)).toEqual(expect.arrayContaining([]));
  });

  describe("clear", () => {
    it("null userId", async () => {
      await folderService.clear();

      stateService.received(1).setEncryptedFolders(Arg.any(), Arg.any());

      expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
    });

    it("matching userId", async () => {
      stateService.getUserId().resolves("1");
      await folderService.clear("1");

      stateService.received(1).setEncryptedFolders(Arg.any(), Arg.any());

      expect((await firstValueFrom(folderService.folders$)).length).toBe(0);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(0);
    });

    it("missmatching userId", async () => {
      await folderService.clear("12");

      stateService.received(1).setEncryptedFolders(Arg.any(), Arg.any());

      expect((await firstValueFrom(folderService.folders$)).length).toBe(1);
      expect((await firstValueFrom(folderService.folderViews$)).length).toBe(2);
    });
  });

  function folderData(id: string, name: string) {
    return Object.assign(new FolderData({} as any), {
      id,
      name,
      revisionDate: null,
    });
  }

  function folder(id: string, name: string) {
    return Object.assign(new Folder({} as any), {
      id,
      name: new EncString(name),
      revisionDate: null,
    });
  }
});
