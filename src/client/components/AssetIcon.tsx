import { Avatar } from '@mui/material';
import Char from '../classes/char';
import Role from '../classes/role';

const ICON_SIZES = {
    s: 10,
    m: 20,
    l: 30,
};

interface IconProps {
    asset: Role | Char;
    size: keyof typeof ICON_SIZES;
}
const AssetIcon = ({ asset, size }: IconProps) => {
    // this doesn't seem to allow the changing of colour
    return (
        <Avatar
            alt={asset.name}
            src={asset.icon}
            sx={{ width: ICON_SIZES[size], height: ICON_SIZES[size], backgroundcolor: 'white' }}
        />
    );
};

export default AssetIcon;
