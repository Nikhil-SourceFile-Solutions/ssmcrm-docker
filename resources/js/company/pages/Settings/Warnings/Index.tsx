import React from 'react';
import RiskProfile from './RiskProfile';

const componentMap = {
    RiskProfile: RiskProfile,
};

function Index({ warnings }) {
    console.log("warnings", warnings);

    return (
        <div className='mb-5'>
            {warnings.map((area, index) => {
                const AreaComponent = componentMap[area.area]; // Dynamically get the component
                return (
                    <React.Fragment key={index}>
                        {AreaComponent ? <AreaComponent data={area} /> : null}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

export default Index;
