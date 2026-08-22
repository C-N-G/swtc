import { Avatar } from '@mui/material';
import Char from '../classes/char';
import Role from '../classes/role';

const ICON_SIZES = {
    s: 24,
    m: 48,
    l: 64,
};

// CSS filter generator to convert from black to target hex color
// https://codepen.io/sosuke/pen/Pjoqqp
interface ColorObject {
    [color: string]: string;
}
const COLORS: ColorObject = {
    Unknown:
        'invert(100%) sepia(0%) saturate(24%) hue-rotate(114deg) brightness(108%) contrast(108%)',
    Agent: 'invert(17%) sepia(99%) saturate(7496%) hue-rotate(243deg) brightness(99%) contrast(111%)',
    Detrimental:
        'invert(21%) sepia(78%) saturate(4325%) hue-rotate(271deg) brightness(102%) contrast(121%)',
    Antagonist:
        'invert(84%) sepia(62%) saturate(3080%) hue-rotate(344deg) brightness(102%) contrast(98%)',
};

interface IconProps {
    asset: Role | Char | undefined;
    size: keyof typeof ICON_SIZES;
}
const AssetIcon = ({ asset, size }: IconProps) => {
    // this doesn't seem to allow the changing of colour

    const getColor = (asset: Role | Char) => {
        if (asset instanceof Role) {
            if (!Object.keys(COLORS).includes(asset.type)) {
                return COLORS.Unknown;
            }
            return COLORS[asset.type];
        }

        return COLORS.Unknown;
    };

    if (asset === undefined) {
        return;
    }

    return (
        <Avatar
            alt={asset.name}
            src={asset.icon}
            sx={{
                width: ICON_SIZES[size],
                height: ICON_SIZES[size],
                filter: getColor(asset),
            }}
        />
    );
};

export default AssetIcon;
