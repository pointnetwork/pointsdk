import React, {useState, ChangeEvent} from 'react';
import Box from '@mui/material/Box';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

type Props = {
    events: string[];
    selected: string[];
    onSelectOne: (ev: ChangeEvent<HTMLInputElement>) => void;
    onSelectAll: (events: string[]) => void;
};

const EventList = ({events, selected, onSelectOne, onSelectAll}: Props) => {
    const [allSelected, setAllSelected] = useState(false);

    const handleSelectAll = (ev: ChangeEvent<HTMLInputElement>) => {
        onSelectAll(ev.target.checked ? events : []);
        setAllSelected(ev.target.checked);
    };

    return (
        <Box maxHeight="40vh" overflow="auto" px={2}>
            {events.map(e => {
                const parts = e.split(':');
                if (parts.length < 2) {
                    return null;
                }
                const contractName = parts.shift()!;
                const eventName = parts.join(':');

                return (
                    <FormGroup key={e}>
                        <FormControlLabel
                            label={eventName}
                            title={`From contract ${contractName}`}
                            control={
                                <Checkbox
                                    name={e}
                                    checked={selected.includes(e)}
                                    onChange={onSelectOne}
                                />
                            }
                        />
                    </FormGroup>
                );
            })}

            {events.length > 1 ? (
                <FormGroup>
                    <FormControlLabel
                        label="Select All"
                        control={
                            <Checkbox
                                name="select-all"
                                checked={allSelected}
                                onChange={handleSelectAll}
                            />
                        }
                    />
                </FormGroup>
            ) : null}
        </Box>
    );
};

export default EventList;
