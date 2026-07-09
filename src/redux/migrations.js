import { createMigrate } from 'redux-persist';
import stacks from "../navigation/stackEnum";

const migrations = {
    1: (state) => {
        return {
            ...state,
        };
    },
    2: (state) => {
        return {
            ...state,
            stack_name: stacks.ON_BOARD_STACK
        };

    },
}


export default createMigrate(
    migrations,
    {
        debug: true,
    },
);