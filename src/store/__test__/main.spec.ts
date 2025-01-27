import { toJS } from 'mobx';
import sinon from 'sinon';
import moment from 'moment';
import { waitFor } from '@testing-library/react';
import { Person, PersonBounty } from 'store/interface';
import { people } from '../../__test__/__mockData__/persons';
import { user } from '../../__test__/__mockData__/user';
import { MeInfo, emptyMeInfo, uiStore } from '../ui';
import { MainStore } from '../main';
import { localStorageMock } from '../../__test__/__mockData__/localStorage';
import { TribesURL, getHost } from '../../config';
import mockBounties, {
  expectedBountyResponses,
  filterBounty
} from '../../bounties/__mock__/mockBounties.data';

let fetchStub: sinon.SinonStub;
let mockApiResponseData: any[];

const origFetch = global.fetch;

const Crypto = {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }
};

beforeAll(() => {
  fetchStub = sinon.stub(global, 'fetch');
  fetchStub.returns(Promise.resolve({ status: 200, json: () => Promise.resolve({}) })); // Mock a default behavior
  mockApiResponseData = [
    { uuid: 'cm3eulatu2rvqi9o75ug' },
    { uuid: 'cldl1g04nncmf23du7kg' },
    { orgUUID: 'cmas9gatu2rvqiev4ur0' }
  ];
  global.crypto = Crypto as any;
});

afterAll(() => {
  global.fetch = origFetch;

  sinon.restore();
});

describe('Main store', () => {
  beforeEach(async () => {
    uiStore.setMeInfo(user);
    localStorageMock.setItem('ui', JSON.stringify(uiStore));
  });

  afterEach(() => {
    fetchStub.reset();
  });

  it('should call endpoint on addWorkspace', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const addWorkspace = {
      img: '',
      name: 'New Workspaceination test',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce'
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.addWorkspace(addWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(addWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on addWorkspace with description, github and website url', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const addWorkspace = {
      img: '',
      name: 'New Workspaceination test',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      description: 'My test Workspace',
      github: 'https://github.com/john-doe',
      website: 'https://john.doe'
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.addWorkspace(addWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(addWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on UpdateWorkspace Name', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const updateWorkspace = {
      id: '42',
      uuid: 'clic8k04nncuuf32kgr0',
      name: 'TEST1',
      description: '',
      github: '',
      website: '',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      img: 'https://memes.sphinx.chat/public/NVhwFqDqHKAC-_Sy9pR4RNy8_cgYuOVWgohgceAs-aM=',
      created: '2023-11-27T16:31:12.699355Z',
      updated: '2023-11-27T16:31:12.699355Z',
      show: false,
      deleted: false,
      bounty_count: 1
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.updateWorkspace(updateWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(updateWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on UpdateWorkspace description, github url and website url, non mandatory fields', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const updateWorkspace = {
      id: '42',
      uuid: 'clic8k04nncuuf32kgr0',
      name: 'TEST1',
      owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
      img: 'https://memes.sphinx.chat/public/NVhwFqDqHKAC-_Sy9pR4RNy8_cgYuOVWgohgceAs-aM=',
      created: '2023-11-27T16:31:12.699355Z',
      updated: '2023-11-27T16:31:12.699355Z',
      show: false,
      deleted: false,
      bounty_count: 1,
      description: 'Update description',
      website: 'https://john.doe',
      github: 'https://github.com/john-doe'
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.updateWorkspace(updateWorkspace);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(updateWorkspace),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on saveBounty', () => {
    const mainStore = new MainStore();
    mainStore.saveBounty = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ status: 200, message: 'success' }));
    const bounty = {
      body: {
        title: 'title',
        description: 'description',
        amount: 100,
        owner_pubkey: user.owner_pubkey,
        owner_alias: user.alias,
        owner_contact_key: user.contact_key,
        owner_route_hint: user.route_hint ?? '',
        extras: user.extras,
        price_to_meet: user.price_to_meet,
        img: user.img,
        tags: [],
        route_hint: user.route_hint
      }
    };
    mainStore.saveBounty(bounty);
    expect(mainStore.saveBounty).toBeCalledWith({
      body: bounty.body
    });
  });

  it('should save user profile', async () => {
    const mainStore = new MainStore();
    const person = {
      owner_pubkey: user.owner_pubkey,
      owner_alias: user.alias,
      owner_contact_key: user.contact_key,
      owner_route_hint: user.route_hint ?? '',
      description: user.description,
      extras: user.extras,
      price_to_meet: user.price_to_meet,
      img: user.img,
      tags: [],
      route_hint: user.route_hint
    };
    mainStore.saveProfile(person);

    expect(toJS(uiStore.meInfo)).toEqual(user);
    expect(localStorageMock.getItem('ui')).toEqual(JSON.stringify(uiStore));
  });

  it('should call endpoint on addWorkspaceUser', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = { status: 200, message: 'success' };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = {
      owner_pubkey: user.owner_pubkey || '',
      workspace_uuid: mockApiResponseData[2]
    };

    const expectedHeaders = {
      'Content-Type': 'application/json',
      'x-jwt': 'test_jwt'
    };

    await mainStore.addWorkspaceUser(workspaceUser);

    sinon.assert.calledWith(
      fetchStub,
      `${TribesURL}/workspaces/users/${mockApiResponseData[2]}`,
      sinon.match({
        method: 'POST',
        headers: expectedHeaders,
        body: JSON.stringify(workspaceUser),
        mode: 'cors'
      })
    );
  });

  it('should call endpoint on getWorkspaceUsers', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves(mockApiResponseData.slice(0, 1))
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const endpoint = `${TribesURL}/workspaces/users/${mockApiResponseData[2].orgUUID}`;

    const users = await mainStore.getWorkspaceUsers(mockApiResponseData[2].orgUUID);

    sinon.assert.calledWithMatch(fetchStub, endpoint, sinon.match.any);
    expect(users).toEqual(mockApiResponseData.slice(0, 1));
  });

  it('should call endpoint on getUserWorkspaces', async () => {
    const mainStore = new MainStore();
    const userId = 232;
    const mockWorkspaces = [
      {
        id: 42,
        uuid: 'clic8k04nncuuf32kgr0',
        name: 'TEST',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
        img: 'https://memes.sphinx.chat/public/NVhwFqDqHKAC-_Sy9pR4RNy8_cgYuOVWgohgceAs-aM=',
        created: '2023-11-27T16:31:12.699355Z',
        updated: '2023-11-27T16:31:12.699355Z',
        show: false,
        deleted: false,
        bounty_count: 1
      },
      {
        id: 55,
        uuid: 'cmen35itu2rvqicrm020',
        name: 'Workspaceination name test',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
        img: '',
        created: '2024-01-09T16:17:26.202555Z',
        updated: '2024-01-09T16:17:26.202555Z',
        show: false,
        deleted: false
      },
      {
        id: 56,
        uuid: 'cmen38itu2rvqicrm02g',
        name: 'New Workspaceination test',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '035f22835fbf55cf4e6823447c63df74012d1d587ed60ef7cbfa3e430278c44cce',
        img: '',
        created: '2024-01-09T16:17:38.652072Z',
        updated: '2024-01-09T16:17:38.652072Z',
        show: false,
        deleted: false
      },
      {
        id: 49,
        uuid: 'cm7c24itu2rvqi9o7620',
        name: 'TESTing',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '02af1ea854c7dc8634d08732d95c6057e6e08e01723da4f561d711a60aea708c00',
        img: '',
        created: '2023-12-29T12:52:34.62057Z',
        updated: '2023-12-29T12:52:34.62057Z',
        show: false,
        deleted: false
      },
      {
        id: 51,
        uuid: 'cmas9gatu2rvqiev4ur0',
        name: 'TEST_NEW',
        description: 'test',
        github: 'https://github.com/stakwork',
        website: 'https://community.sphinx.chat',
        owner_pubkey: '03cbb9c01cdcf91a3ac3b543a556fbec9c4c3c2a6ed753e19f2706012a26367ae3',
        img: '',
        created: '2024-01-03T20:34:09.585609Z',
        updated: '2024-01-03T20:34:09.585609Z',
        show: false,
        deleted: false
      }
    ];
    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves(mockWorkspaces)
    };
    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = await mainStore.getUserWorkspaces(userId);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/user/${userId}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    expect(workspaceUser).toEqual(mockWorkspaces);
  });

  it('should call endpoint on getUserWorkspacesUuid', async () => {
    const mainStore = new MainStore();
    const uuid = 'ck1p7l6a5fdlqdgmmnpg';
    const mockWorkspaces = {
      id: 6,
      uuid: 'ck1p7l6a5fdlqdgmmnpg',
      name: 'Stakwork',
      owner_pubkey: '021ae436bcd40ca21396e59be8cdb5a707ceacdb35c1d2c5f23be7584cab29c40b',
      img: 'https://memes.sphinx.chat/public/_IO8M0UXltb3mbK0qso63ux86AP-2nN2Ly9uHo37Ku4=',
      created: '2023-09-14T23:14:28.821632Z',
      updated: '2023-09-14T23:14:28.821632Z',
      show: true,
      deleted: false,
      bounty_count: 8,
      budget: 640060
    };
    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves(mockWorkspaces)
    };
    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = await mainStore.getUserWorkspaceByUuid(uuid);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/${uuid}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    );

    expect(workspaceUser).toEqual(mockWorkspaces);
  });
  it('should call endpoint on getWorkspaceUser', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves({
        uuid: mockApiResponseData[0].uuid
      })
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspaceUser = await mainStore.getWorkspaceUser(mockApiResponseData[0].uuid);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/foruser/${mockApiResponseData[0].uuid}`,
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': 'test_jwt',
          'Content-Type': 'application/json'
        }
      })
    );

    expect(workspaceUser).toEqual({
      uuid: mockApiResponseData[0].uuid
    });
  });

  it('should call endpoint on getWorkspaceUsersCount', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves({
        count: 2
      })
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const workspacesCount = await mainStore.getWorkspaceUsersCount(mockApiResponseData[2].orgUUID);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/users/${mockApiResponseData[2].orgUUID}/count`,
      sinon.match({
        method: 'GET',
        mode: 'cors'
      })
    );

    expect(workspacesCount).toEqual({ count: 2 });
  });

  it('should call endpoint on deleteWorkspaceUser', async () => {
    const mainStore = new MainStore();

    const mockApiResponse = {
      status: 200,
      json: sinon.stub().resolves({
        message: 'success'
      })
    };

    fetchStub.resolves(Promise.resolve(mockApiResponse));

    const orgUserUUID = mockApiResponseData[1].uuid;
    const deleteRequestBody = {
      org_uuid: mockApiResponseData[2].orgUUID,
      user_created: '2024-01-03T22:07:39.504494Z',
      id: 263,
      uuid: mockApiResponseData[0].uuid,
      owner_pubkey: '02af1ea854c7dc8634d08732d95c6057e6e08e01723da4f561d711a60aea708c00',
      owner_alias: 'Nayan',
      unique_name: 'nayan',
      description: 'description',
      tags: [],
      img: '',
      created: '2023-12-23T14:31:49.963009Z',
      updated: '2023-12-23T14:31:49.963009Z',
      unlisted: false,
      deleted: false,
      last_login: 1704289377,
      owner_route_hint:
        '03a6ea2d9ead2120b12bd66292bb4a302c756983dc45dcb2b364b461c66fd53bcb:1099519819777',
      owner_contact_key:
        'MIIBCgKCAQEAugvVYqgIIBmpLCjmaBhLi6GfxssrdM74diTlKpr+Qr/0Er1ND9YQ3HUveaI6V5DrBunulbSEZlIXIqVSLm2wobN4iAqvoGGx1aZ13ByOJLjINjD5nA9FnfAJpvcMV/gTDQzQL9NHojAeMx1WyAlhIILdiDm9zyCJeYj1ihC660xr6MyVjWn9brJv47P+Bq2x9AWPufYMMgPH7GV1S7KkjEPMbGCdUvUZLs8tzzKtNcABCHBQKOcBNG/D4HZcCREMP90zj8/NUzz9x92Z5zuvJ0/eZVF91XwyMtThrJ+AnrXWv7AEVy63mu9eAO3UYiUXq2ioayKBgalyos2Mcs9DswIDAQAB',
      price_to_meet: 0,
      new_ticket_time: 0,
      twitter_confirmed: false,
      extras: {},
      github_issues: {}
    };

    const deleteResponse = await mainStore.deleteWorkspaceUser(deleteRequestBody, orgUserUUID);

    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/users/${orgUserUUID}`,
      sinon.match({
        method: 'DELETE',
        mode: 'cors',
        body: JSON.stringify(deleteRequestBody),
        headers: sinon.match({
          'x-jwt': 'test_jwt',
          'Content-Type': 'application/json'
        })
      })
    );

    expect(deleteResponse.status).toBe(200);
  });

  it('should send request delete request with correct body and url', async () => {
    const url = `${TribesURL}/gobounties/pub_key/1111`;
    const allBountiesUrl = `http://${getHost()}/gobounties/all?limit=10&sortBy=created&search=&page=1&resetPage=true&Open=true&Assigned=false&Paid=false`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };

    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        status: 200
      }) as any
    );

    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([mockBounties[0]])
      }) as any
    );

    await store.deleteBounty(1111, 'pub_key');

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(store.peopleBounties.length).toEqual(0);
    expect(store.peopleBounties).toEqual([]);
  });

  it('should not panic if failed to delete bounty', async () => {
    const url = `${TribesURL}/gobounties/pub_key/1111`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).throwsException();

    await store.deleteBounty(1111, 'pub_key');

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(store.peopleBounties.length).toEqual(0);
  });

  it('should not return false if asignee removed successfully', async () => {
    const url = `${TribesURL}/gobounties/assignee`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      body: JSON.stringify({
        owner_pubkey: 'pub_key',
        created: '1111'
      }),
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        status: 200
      }) as any
    );

    const res = await store.deleteBountyAssignee({ owner_pubkey: 'pub_key', created: '1111' });

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).not.toBeFalsy();
  });

  it('should  return false if failed to remove asignee ', async () => {
    const url = `${TribesURL}/gobounties/assignee`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'DELETE',
      mode: 'cors',
      body: JSON.stringify({
        owner_pubkey: 'pub_key',
        created: '1111'
      }),
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).throwsException();

    const res = await store.deleteBountyAssignee({ owner_pubkey: 'pub_key', created: '1111' });

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).toBeFalsy();
  });

  it('should successfully update bounty payment status', async () => {
    const url = `${TribesURL}/gobounties/paymentstatus/1111`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        status: 200
      }) as any
    );

    const res = await store.updateBountyPaymentStatus(1111);

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).not.toBeFalsy();
  });

  it('should return false if failed to update bounty status', async () => {
    const url = `${TribesURL}/gobounties/paymentstatus/1111`;

    const store = new MainStore();
    store.initializeSessionId();

    const expectedRequestOptions: RequestInit = {
      method: 'POST',
      mode: 'cors',
      headers: {
        'x-jwt': user.tribe_jwt,
        'Content-Type': 'application/json',
        'x-session-id': store.sessionId
      }
    };
    fetchStub.withArgs(url, expectedRequestOptions).throwsException();

    const res = await store.updateBountyPaymentStatus(1111);

    expect(fetchStub.withArgs(url, expectedRequestOptions).calledOnce).toEqual(true);
    expect(res).toBeFalsy();
  });

  it('should successfully return requested bounty', async () => {
    const url = `http://${getHost()}/gobounties/id/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve([mockBounties[0]])
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res).toEqual([expectedBountyResponses[0]]);
  });

  it('should return empty array if failed to fetch bounty', async () => {
    const url = `http://${getHost()}/gobounties/id/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 404,
        ok: false
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res.length).toEqual(0);
  });

  it('should successfully return index of requested bounty', async () => {
    const url = `http://${getHost()}/gobounties/index/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: () => Promise.resolve(1)
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyIndexById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res).toEqual(1);
  });

  it('should return 0 if failed to fetch index', async () => {
    const url = `http://${getHost()}/gobounties/index/1111`;
    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        status: 400,
        ok: false
      }) as any
    );

    const store = new MainStore();
    const res = await store.getBountyIndexById(1111);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(res).toEqual(0);
  });

  it('should set all query params, page, limit, search, and languages when fetching bounties, user logged out', async () => {
    // Arrange: Set user as logged out
    uiStore.setMeInfo(emptyMeInfo);

    // Stub the fetch with a flexible matcher
    fetchStub
      .withArgs(
        sinon.match((url: string) => url.startsWith(`http://${getHost()}/gobounties/all`)),
        sinon.match.any
      )
      .returns(
        Promise.resolve({
          status: 200,
          ok: true,
          json: (): Promise<any> => Promise.resolve([mockBounties[0]])
        }) as any
      );

    // Act: Create the store and fetch bounties
    const store = new MainStore();
    const bounties = await store.getPeopleBounties({
      resetPage: true,
      search: 'random',
      limit: 10,
      page: 1,
      sortBy: 'updatedat'
      // Include languages if applicable
    });

    // Assert: Check that bounties are set correctly
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedBountyResponses[0]]);
    expect(bounties).toEqual([expectedBountyResponses[0]]);
  });

  it('should reset exisiting bounty if reset flag is passed, signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/gobounties/all?limit=10&sortBy=updatedat&search=random&page=1&resetPage=true`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    store.setPeopleBounties([expectedBountyResponses[0] as any]);
    expect(store.peopleBounties.length).toEqual(1);

    const bounties = await store.getPeopleBounties({
      resetPage: true,
      search: 'random',
      limit: 10,
      page: 1,
      sortBy: 'updatedat'
    });
    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedResponse]);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should add to exisiting bounty if next page is fetched, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/gobounties/all?limit=10&sortBy=updatedat&search=random&page=1&resetPage=false`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    const bountyAlreadyPresent = { ...expectedBountyResponses[0] } as any;
    bountyAlreadyPresent.body.id = 1;
    store.setPeopleBounties([bountyAlreadyPresent]);
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties[0].body.id).not.toEqual(2);

    const bounties = await store.getPeopleBounties({
      resetPage: false,
      search: 'random',
      limit: 10,
      page: 1,
      sortBy: 'updatedat'
    });

    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(2);
    expect(store.peopleBounties[1]).toEqual(expectedResponse);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should successfully fetch people, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/people?resetPage=true&search=&limit=500&page=1&sortBy=last_login`;
    const mockPeople = { ...people[1] };
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockPeople }])
      }) as any
    );

    const store = new MainStore();
    store.setPeople([people[0]]);
    expect(store._people.length).toEqual(1);
    expect(store._people[0]).toEqual(people[0]);

    const res = await store.getPeople({
      resetPage: true,
      search: 'random',
      limit: 11,
      page: 1,
      sortBy: 'updatedat'
    });

    expect(store._people.length).toEqual(1);
    expect(store._people[0]).toEqual(mockPeople);
    expect(res[0]).toEqual(mockPeople);
  });

  it('should hide current user, user signed in', async () => {
    const allBountiesUrl = `http://${getHost()}/people?resetPage=false&search=&limit=500&page=2&sortBy=last_login`;
    const mockPeople = { ...people[0] };
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockPeople }])
      }) as any
    );

    const store = new MainStore();
    const res = await store.getPeople({
      resetPage: false,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });

    expect(store._people.length).toEqual(1);
    expect(store._people[0].hide).toEqual(true);
    expect(res).toBeTruthy();
  });

  it('should fetch and store workspace bounties successfully, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/workspaces/bounties/1111`;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([mockBounties[0]])
      }) as any
    );

    const store = new MainStore();
    const bounties = await store.getWorkspaceBounties('1111', {
      resetPage: true,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });

    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedBountyResponses[0]]);
    expect(bounties).toEqual([expectedBountyResponses[0]]);
  });

  it('should reset exisiting workspace bounty if reset flag is passed, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/workspaces/bounties/1111`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    store.setPeopleBounties([expectedBountyResponses[0] as any]);
    expect(store.peopleBounties.length).toEqual(1);

    const bounties = await store.getWorkspaceBounties('1111', {
      resetPage: true,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });
    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties).toEqual([expectedResponse]);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should add to exisiting bounty if reset flag is not passed, user signed out', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const allBountiesUrl = `http://${getHost()}/workspaces/bounties/1111`;
    const mockBounty = { ...mockBounties[0] };
    mockBounty.bounty.id = 2;
    fetchStub.withArgs(allBountiesUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true,
        json: (): Promise<any> => Promise.resolve([{ ...mockBounty }])
      }) as any
    );

    const store = new MainStore();
    const bountyAlreadyPresent = { ...expectedBountyResponses[0] } as any;
    bountyAlreadyPresent.body.id = 1;
    store.setPeopleBounties([bountyAlreadyPresent]);
    expect(store.peopleBounties.length).toEqual(1);
    expect(store.peopleBounties[0].body.id).not.toEqual(2);

    const bounties = await store.getWorkspaceBounties('1111', {
      resetPage: false,
      search: 'random',
      limit: 11,
      page: 2,
      sortBy: 'updatedat'
    });

    const expectedResponse = { ...expectedBountyResponses[0] };
    expectedResponse.body.id = 2;
    expect(store.peopleBounties.length).toEqual(2);
    expect(store.peopleBounties[1]).toEqual(expectedResponse);
    expect(bounties).toEqual([expectedResponse]);
  });

  it('should make a succcessful bounty payment', async () => {
    const store = new MainStore();
    uiStore.setMeInfo(emptyMeInfo);
    const bounty = expectedBountyResponses[0];

    store.makeBountyPayment = jest
      .fn()
      .mockReturnValueOnce(Promise.resolve({ status: 200, message: 'success' }));

    const body = {
      id: bounty.body.id,
      websocket_token: 'test_websocket_token'
    };

    store.makeBountyPayment(body);
    expect(store.makeBountyPayment).toBeCalledWith(body);
  });

  it('it should get a s3 URL afer a successful metrics url call', async () => {
    const store = new MainStore();
    uiStore.setMeInfo(emptyMeInfo);

    store.exportMetricsBountiesCsv = jest
      .fn()
      .mockReturnValueOnce(
        Promise.resolve({ status: 200, body: 'https://test-s3url.com/metrics.csv' })
      );

    const start_date = moment().subtract(30, 'days').unix().toString();
    const end_date = moment().unix().toString();

    const body = {
      start_date,
      end_date
    };

    store.exportMetricsBountiesCsv(body, '');
    expect(store.exportMetricsBountiesCsv).toBeCalledWith(body, '');
  });

  it('I should be able to test that the signed-in user details are persisted in the local storage', async () => {
    const mockUser: MeInfo = {
      id: 20,
      pubkey: 'test_pub_key',
      uuid: mockApiResponseData[0].uuid,
      contact_key: 'test_owner_contact_key',
      owner_route_hint: 'test_owner_route_hint',
      alias: 'Owner Name',
      photo_url: '',
      github_issues: [],
      route_hint: 'test_hint:1099567661057',
      price_to_meet: 0,
      jwt: 'test_jwt',
      tribe_jwt: 'test_jwt',
      url: 'http://localhost:5002',
      description: 'description',
      verification_signature: 'test_verification_signature',
      extras: {
        email: [{ value: 'testEmail@sphinx.com' }],
        liquid: [{ value: 'none' }],
        wanted: []
      },
      owner_alias: 'Owner Name',
      owner_pubkey: 'test_pub_key',
      img: '/static/avatarPlaceholders/placeholder_34.jpg',
      twitter_confirmed: false,
      isSuperAdmin: false,
      websocketToken: 'test_websocketToken'
    };
    uiStore.setMeInfo(mockUser);
    uiStore.setShowSignIn(true);

    localStorageMock.setItem('ui', JSON.stringify(uiStore));

    expect(uiStore.showSignIn).toBeTruthy();
    expect(uiStore.meInfo).toEqual(mockUser);
    expect(localStorageMock.getItem('ui')).toEqual(JSON.stringify(uiStore));
  });

  it('I should be able to test that when signed out the user data is deleted', async () => {
    // Shows first if signed in
    uiStore.setShowSignIn(true);
    localStorageMock.setItem('ui', JSON.stringify(uiStore));

    expect(uiStore.showSignIn).toBeTruthy();
    expect(localStorageMock.getItem('ui')).toEqual(JSON.stringify(uiStore));
    //Shows when signed out
    uiStore.setMeInfo(null);
    localStorageMock.setItem('ui', null);

    expect(localStorageMock.getItem('ui')).toEqual(null);
  });

  it('I should be able to test that signed-in user details can be displayed such as the name and pubkey', async () => {
    uiStore.setShowSignIn(true);

    expect(uiStore.meInfo?.owner_alias).toEqual(user.alias);
    expect(uiStore.meInfo?.owner_pubkey).toEqual(user.pubkey);
  });

  it('I should be able to test that a signed-in user can update their details', async () => {
    uiStore.setShowSignIn(true);
    expect(uiStore.meInfo?.alias).toEqual('Vladimir');

    user.alias = 'John';
    uiStore.setMeInfo(user);

    expect(uiStore.meInfo?.alias).toEqual('John');
  });

  it('I should be able to test that a signed-in user can make an API request without getting a 401 (unauthorized error)', async () => {
    uiStore.setShowSignIn(true);
    const loggedUrl = `http://${getHost()}/admin/auth`;
    const res = await fetchStub.withArgs(loggedUrl, sinon.match.any).returns(
      Promise.resolve({
        status: 200,
        ok: true
      }) as any
    );
    expect(res).toBeTruthy();
  });

  it('I should be able to test that when a user is signed out, a user will get a 401 error if they make an API call', async () => {
    uiStore.setMeInfo(emptyMeInfo);
    const urlNoLogged = `http://${getHost()}/admin/auth`;

    const res = await fetchStub.withArgs(urlNoLogged, sinon.match.any).returns(
      Promise.resolve({
        status: 401,
        ok: false
      }) as any
    );
    expect(res).toBeTruthy();
  });

  it('should accept search query and return results based on query ', async () => {
    const store = new MainStore();

    const searchCriteria = {
      limit: 10,
      sortBy: 'created',
      search: 'test',
      page: 1,
      resetPage: false
    };

    const mockApiResponse = {
      status: 200,
      ok: true,
      json: async () => Promise.resolve([mockBounties[0]])
    };

    const bountiesUrl = `http://${getHost()}/gobounties/all?limit=${searchCriteria.limit}&sortBy=${
      searchCriteria.sortBy
    }&search=${searchCriteria.search}&page=${searchCriteria.page}&resetPage=${
      searchCriteria.resetPage
    }`;

    fetchStub.callsFake((url: string) => {
      if (url === bountiesUrl) {
        return Promise.resolve(mockApiResponse);
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    await store.getPeopleBounties(searchCriteria);

    waitFor(() => {
      sinon.assert.calledWithMatch(fetchStub, bountiesUrl);
      expect(fetchStub.calledOnce).toBe(true);
      expect(store.peopleBounties).toHaveLength(1);
      expect(store.peopleBounties[0].body.title).toEqual(searchCriteria.search);
    });
  });

  it('should return filter by the languages, status, and other criteria', async () => {
    const store = new MainStore();
    const filterCriteria = {
      limit: 25,
      page: 1,
      sortBy: 'created',
      coding_languages: 'Typescript',
      Open: true,
      Assigned: false,
      Paid: false
    };

    const apiResponse = {
      status: 200,
      ok: true,
      json: async () => Promise.resolve([filterBounty])
    };
    fetchStub.callsFake((url: string) => {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;

      const isValidBaseUrl =
        urlObj.origin === `http://${getHost()}` && urlObj.pathname === '/gobounties/all';

      const isValidParams =
        params.get('limit') === filterCriteria.limit.toString() &&
        params.get('sortBy') === filterCriteria.sortBy &&
        params.get('coding_languages') === filterCriteria.coding_languages &&
        params.get('page') === filterCriteria.page.toString() &&
        params.get('Open') === String(filterCriteria.Open) &&
        params.get('Assigned') === String(filterCriteria.Assigned) &&
        params.get('Paid') === String(filterCriteria.Paid);

      if (isValidBaseUrl && isValidParams) {
        return Promise.resolve(apiResponse);
      }
    });

    await store.getPeopleBounties(filterCriteria);
    sinon.assert.called(fetchStub);
    expect(fetchStub.calledOnce).toEqual(true);
    expect(store.peopleBounties[0].body.coding_languages).toEqual(filterCriteria.coding_languages);
  });

  it('should successfully fetch workspace users', async () => {
    const mockUsers: Person[] = [
      {
        id: 1,
        unique_name: 'user-one',
        owner_pubkey: 'pub-key-1',
        uuid: 'user-1',
        owner_alias: 'User One',
        description: 'Test user one',
        img: 'image1.jpg',
        tags: ['developer'],
        photo_url: 'photo1.jpg',
        alias: 'User One',
        route_hint: 'hint1',
        contact_key: 'contact1',
        price_to_meet: 100,
        url: 'https://test1.com',
        verification_signature: 'sig1',
        extras: {
          email: [],
          liquid: [],
          wanted: []
        }
      },
      {
        id: 2,
        unique_name: 'user-two',
        owner_pubkey: 'pub-key-2',
        uuid: 'user-2',
        owner_alias: 'User Two',
        description: 'Test user two',
        img: 'image2.jpg',
        tags: ['designer'],
        photo_url: 'photo2.jpg',
        alias: 'User Two',
        route_hint: 'hint2',
        contact_key: 'contact2',
        price_to_meet: 200,
        url: 'https://test2.com',
        verification_signature: 'sig2',
        extras: {
          email: [],
          liquid: [],
          wanted: []
        }
      }
    ];

    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUsers)
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(
      fetchStub.calledWith(
        url,
        sinon.match({
          method: 'GET',
          mode: 'cors'
        })
      )
    ).toBeTruthy();
    expect(result).toEqual(mockUsers);
  });

  it('should return empty array when workspace users fetch fails', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(Promise.reject(new Error('API Error')));

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(result).toEqual([]);
  });

  it('should return empty array for malformed workspace users response', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null)
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);
    waitFor(() => {
      expect(result).toEqual([]);
    });
  });

  it('should handle empty workspace UUID for users fetch', async () => {
    const workspaceUuid = '';

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(result).toEqual([]);
  });
  it('should return empty array when API call fails', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(Promise.reject(new Error('API Error')));

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(result).toEqual([]);
  });

  it('should return empty array when response is not ok', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve([])
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(result).toEqual([]);
  });

  it('should handle malformed response data', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(null)
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);
    waitFor(() => {
      expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
      expect(result).toEqual([]);
    });
  });

  it('should make request with correct parameters', async () => {
    const workspaceUuid = 'workspace-123';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    const expectedRequestOptions = {
      method: 'GET',
      mode: 'cors'
    };

    fetchStub.withArgs(url, expectedRequestOptions).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(people)
      }) as any
    );

    const store = new MainStore();
    await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.calledWith(url, sinon.match(expectedRequestOptions))).toEqual(true);
  });

  it('should handle empty workspace UUID', async () => {
    const workspaceUuid = '';
    const url = `${TribesURL}/workspaces/users/${workspaceUuid}`;

    fetchStub.withArgs(url, sinon.match.any).returns(
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve([])
      }) as any
    );

    const store = new MainStore();
    const result = await store.getWorkspaceUsers(workspaceUuid);

    expect(fetchStub.withArgs(url, sinon.match.any).calledOnce).toEqual(true);
    expect(result).toEqual([]);
  });
});

describe('getUserRoles', () => {
  let mainStore: MainStore;
  const validUuid = 'valid-uuid-123';
  const validUser = 'valid-user-456';
  const mockJwt = 'test_jwt';
  const mockSessionId = 'test-session-id';

  beforeEach(() => {
    mainStore = new MainStore();
    uiStore.setMeInfo({ ...user, tribe_jwt: mockJwt });
    sinon.stub(mainStore, 'getSessionId').returns(mockSessionId);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Valid Inputs with Existing User and UUID', async () => {
    const mockRoles = [
      { id: 1, name: 'admin' },
      { id: 2, name: 'developer' }
    ];
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockRoles)
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);

    expect(result).toEqual(mockRoles);
    sinon.assert.calledWithMatch(
      fetchStub,
      `${TribesURL}/workspaces/users/role/${validUuid}/${validUser}`,
      {
        method: 'GET',
        headers: {
          'x-jwt': mockJwt,
          'Content-Type': 'application/json',
          'x-session-id': mockSessionId
        }
      }
    );
  });

  it('Valid Inputs with No Roles', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('Empty UUID and User', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getUserRoles('', '');

    expect(result).toEqual([]);

    expect(fetchStub.calledOnce).toBe(true);
    sinon.assert.calledWith(
      fetchStub,
      sinon.match((url: string) => url.includes('/workspaces/users/role/')),
      sinon.match({
        method: 'GET',
        mode: 'cors',
        headers: {
          'x-jwt': mockJwt,
          'Content-Type': 'application/json',
          'x-session-id': mockSessionId
        }
      })
    );
  });

  it('Long UUID and User Strings', async () => {
    const longString = 'a'.repeat(1000);
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve([])
    } as Response);

    const result = await mainStore.getUserRoles(longString, longString);
    expect(result).toEqual([]);
  });

  it('Invalid UUID Format', async () => {
    fetchStub.resolves({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid UUID format' })
    } as Response);

    const result = await mainStore.getUserRoles('invalid-uuid', validUser);
    expect(result).toEqual([]);
  });

  it('Invalid User Format', async () => {
    fetchStub.resolves({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Invalid user format' })
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, 'invalid@user');
    expect(result).toEqual([]);
  });

  it('Network Error During Fetch', async () => {
    fetchStub.rejects(new Error('Network error'));

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('Unauthorized Access', async () => {
    fetchStub.resolves({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' })
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('Server Returns Non-JSON Response', async () => {
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);
    expect(result).toEqual([]);
  });

  it('High Volume of Roles', async () => {
    const largeRolesArray = Array.from({ length: 1000 }, (_: any, i: number) => ({
      id: i,
      name: `role-${i}`
    }));
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(largeRolesArray)
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);

    waitFor(() => {
      expect(result).toEqual(largeRolesArray);
      expect(result.length).toBe(1000);
    });
  });

  it('No meInfo in uiStore', async () => {
    uiStore.setMeInfo(null);
    const result = await mainStore.getUserRoles(validUuid, validUser);
    waitFor(() => {
      expect(result).toEqual([]);
      sinon.assert.notCalled(fetchStub);
    });
  });

  it('Session ID Not Set', async () => {
    sinon.restore();
    sinon.stub(mainStore, 'getSessionId').returns('');

    const mockRoles = [{ id: 1, name: 'admin' }];
    fetchStub.resolves({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockRoles)
    } as Response);

    const result = await mainStore.getUserRoles(validUuid, validUser);

    waitFor(() => {
      sinon.assert.calledWithMatch(
        fetchStub,
        `${TribesURL}/workspaces/users/role/${validUuid}/${validUser}`,
        {
          headers: {
            'x-jwt': mockJwt,
            'Content-Type': 'application/json',
            'x-session-id': ''
          }
        }
      );
      expect(result).toEqual(mockRoles);
    });
  });
});

describe('MainStore.setPersonBounties', () => {
  let mainStore: MainStore;

  beforeEach(() => {
    mainStore = new MainStore();
  });

  it('Standard Input', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Bounty 1' },
        codingLanguage: 'JavaScript',
        estimated_session_length: '2 hours'
      },
      {
        owner_id: '2',
        wanted_type: 'feature',
        person: { name: 'Jane' },
        body: { title: 'Bounty 2' },
        codingLanguage: 'TypeScript',
        estimated_session_length: '4 hours'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Empty Array', () => {
    const bounties: PersonBounty[] = [];
    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual([]);
  });

  it('Single Element Array', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Single Bounty' },
        codingLanguage: 'Python',
        estimated_session_length: '1 hour'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Large Array', () => {
    const bounties: PersonBounty[] = Array.from({ length: 1000 }, (_: unknown, i: number) => ({
      owner_id: i.toString(),
      wanted_type: 'bug',
      person: { name: `Person ${i}` },
      body: { title: `Bounty ${i}` },
      codingLanguage: 'JavaScript',
      estimated_session_length: '3 hours'
    }));

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties.length).toBe(1000);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Array with Null Elements', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: null,
        body: null,
        codingLanguage: '',
        estimated_session_length: ''
      },
      {
        owner_id: '2',
        wanted_type: 'feature',
        person: { name: 'Jane' },
        body: { title: 'Valid Bounty' },
        codingLanguage: 'Ruby',
        estimated_session_length: '2 hours'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Array with Mixed Valid and Invalid Elements', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        person: { name: 'John' },
        body: { title: 'Valid Bounty' },
        codingLanguage: 'Java',
        estimated_session_length: '5 hours'
      },
      {
        owner_id: '2',
        wanted_type: 'invalid_type',
        person: { name: 'Jane' },
        body: { title: 'Invalid Bounty' },
        codingLanguage: 'Go',
        estimated_session_length: '1 hour'
      }
    ];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('Array with Duplicate Elements', () => {
    const duplicateBounty: PersonBounty = {
      owner_id: '1',
      wanted_type: 'bug',
      person: { name: 'John' },
      body: { title: 'Duplicate Bounty' },
      codingLanguage: 'PHP',
      estimated_session_length: '3 hours'
    };

    const bounties: PersonBounty[] = [duplicateBounty, duplicateBounty];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
    expect(mainStore.personAssignedBounties.length).toBe(2);
  });

  it('Array with Missing Properties', () => {
    const bounties: PersonBounty[] = [
      {
        owner_id: '1',
        wanted_type: 'bug',
        codingLanguage: 'C++',
        estimated_session_length: '2 hours'
      },
      {
        owner_id: '2',
        wanted_type: 'feature',
        person: { name: 'Jane' },
        codingLanguage: 'Rust',
        estimated_session_length: '4 hours'
      }
    ] as PersonBounty[];

    mainStore.setPersonBounties(bounties);
    expect(mainStore.personAssignedBounties).toEqual(bounties);
  });

  it('should handle null input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(null as unknown as PersonBounty[]);
      }).toThrow();
    });
  });

  it('should handle undefined input', () => {
    waitFor(() => {
      expect(() => {
        mainStore.setPersonBounties(undefined as unknown as PersonBounty[]);
      }).toThrow();
    });
  });

  it('should handle very large arrays efficiently', () => {
    waitFor(() => {
      const start = performance.now();

      const largeBounties: PersonBounty[] = Array.from(
        { length: 10000 },
        (_: unknown, i: number) => ({
          owner_id: i.toString(),
          wanted_type: 'bug',
          person: { name: `Person ${i}` },
          body: { title: `Bounty ${i}` },
          codingLanguage: 'JavaScript',
          estimated_session_length: '2 hours'
        })
      );

      mainStore.setPersonBounties(largeBounties);

      const end = performance.now();
      const executionTime = end - start;

      expect(executionTime).toBeLessThan(1000);
      expect(mainStore.personAssignedBounties.length).toBe(10000);
    });
  });
});
