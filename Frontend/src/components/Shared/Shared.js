import { Image } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getDefaultGroupImage, getDefaultUserImage } from '../../_constants/avatar';
import { convertAmount, formatMoney } from '../../_helper/money';

function Avatar(props) {
  return <>
    <Image
      style={{ width: '27px', height: '27px', borderRadius: '14px' }}
      src={props.avatar || props.defaultAvatar}
      roundedCircle
    />{' '}
    <b style={props.textColor ? { 'text-color': props.textColor } : null}>{props.label}</b>
  </>;
}

export const ProfileAvatar = (props) => (
  <>
    <div style={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
      <div><Image
        style={{ width: '45px', height: '45px', borderRadius: '22px', border: '2px solid white', marginRight: '1rem' }}
        src={props.user.avatar || getDefaultUserImage()}
        roundedCircle
      />
      </div>
      <div style={{ 'color': 'white', marginRight: '1rem', fontSize: '2rem', fontWeight: '500' }}>{props.user.first_name}</div>
    </div>
  </>
);

export const UserAvatar = (props) => <Avatar avatar={props.user.avatar} defaultAvatar={getDefaultUserImage()} label={props.label || props.user.first_name} />;
export const UserBalanceAvatar = (props) => <Avatar avatar={props.user.avatar} defaultAvatar={getDefaultUserImage()} />;
export const GroupAvatar = (props) => <Avatar avatar={props.group.avatar} defaultAvatar={getDefaultGroupImage()} />;

const LocalizedAmount = (props) => {
  const destinationCurrencyCode = props.user.default_currency;
  const convertedAmount = convertAmount(props.doNotPrintAbs ? props.amount : Math.abs(props.amount), props.currency || 'USD', destinationCurrencyCode);
  const formattedAmount = formatMoney(convertedAmount, destinationCurrencyCode);
  return <b>{formattedAmount}</b>;
}

function mapState(state) {
  const { user } = state.authentication;
  return { user };
}

const connectedLocalizedAmount = connect(mapState, {})(LocalizedAmount);
export { connectedLocalizedAmount as LocalizedAmount };

