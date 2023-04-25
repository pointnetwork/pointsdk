import {Types, ActionMap} from './shared';

export type ManageViewPayload = {
    [Types.update]: string;
};

export type ManageViewActions = ActionMap<ManageViewPayload>[keyof ActionMap<ManageViewPayload>];
