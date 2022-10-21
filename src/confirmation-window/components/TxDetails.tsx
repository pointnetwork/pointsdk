import React, {useEffect, Fragment} from 'react';
import {generate} from 'geopattern';
import {DecodedTxInput} from '../../pointsdk/index.d';
import Address from './Address';
import Price from './Price';
import RawData from './RawData';
import DecodedData from './DecodedData';
import GasEstimate from './GasEstimate';

type Props = {
    rawParams: Record<string, string>;
    decodedTxData: DecodedTxInput | null;
    network: string;
};

const TxDetails = ({rawParams, decodedTxData, network}: Props) => {
    useEffect(() => {
        async function drawBg() {
            try {
                const {data} = (await window.point.wallet.hash()) as {data: {hash: unknown}};
                document.body.style.backgroundImage = generate(String(data.hash)).toDataUrl();
            } catch (e) {
                console.error(e);
            }
        }
        void drawBg();
    }, [rawParams]);

    return (
        <>
            {decodedTxData?.gas?.value && decodedTxData?.gas?.currency ? (
                <GasEstimate gas={decodedTxData.gas} />
            ) : null}
            {Object.entries(rawParams).map(([key, value], idx) => {
                switch (key) {
                    case 'from':
                    case 'to':
                    case 'beneficiary':
                        return <Address key={idx} label={key} address={value} />;
                    case 'value':
                    case 'gas':
                    case 'gasPrice':
                        return (
                            <Price
                                key={idx}
                                label={key}
                                value={value}
                                network={network}
                                to={rawParams?.to || ''}
                            />
                        );
                    case 'data':
                        if (decodedTxData && JSON.stringify(decodedTxData) !== '{}') {
                            return (
                                <Fragment key={idx}>
                                    <DecodedData data={decodedTxData} />
                                    <RawData label="data (raw)" data={value} />
                                </Fragment>
                            );
                        }
                        return <RawData key={idx} label={key} data={value} />;
                    case 'domain':
                        return decodedTxData && JSON.stringify(decodedTxData) !== '{}' ? (
                            <DecodedData data={decodedTxData} />
                        ) : null;
                    default:
                        return <RawData key={idx} label={key} data={value} />;
                }
            })}
        </>
    );
};

export default TxDetails;
