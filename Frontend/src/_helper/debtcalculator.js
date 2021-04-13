import { convertAmount, SETTLEUP_TXN } from './money';

var _ = require('lodash');

export function calculateDebt(user, transactions, isFriendView = false) {
  const oweAmount = _(transactions)
    .filter((txn) => txn.to.map((u) => u.email).includes(user.email))
    .map((txn) => ({
      txn,
      amount: convertAmount(
        txn.type === SETTLEUP_TXN
          ? txn.amount
          : txn.amount / (txn.to.length + 1),
        txn.currency_code,
        user.default_currency
      ),
    })).sumBy('amount');
  const paidAmount = _(transactions)
    .filter((txn) => txn.from.email === user.email)
    .map((txn) => ({
      txn,
      amount: convertAmount(
        txn.type === SETTLEUP_TXN
          ? txn.amount
          : isFriendView ? txn.amount / (txn.to.length + 1) : (txn.amount * txn.to.length) / (txn.to.length + 1),
        txn.currency_code,
        user.default_currency
      ),
    })).sumBy('amount');

  return JSON.parse(
    JSON.stringify({
      oweAmount: oweAmount,
      paidAmount: paidAmount,
      totalAmount: paidAmount - oweAmount,
    })
  );
}

export function calculateDebtForAGroup(group, transactions) {
  return JSON.parse(
    JSON.stringify(
      _(group.members).filter((member) => member.group_join_status !== "INVITED").map((member) => ({
        user: member,
        ...calculateDebt(member, transactions),
      }))
    )
  );
}

export function calculateDebtPerFriend(user, transactions) {
  const payers = _.map(transactions, (txn) => txn.from);
  const payees = _.flatMap(transactions, (txn) => txn.to);
  const friends = _.unionBy(payers, payees, 'email').filter(
    (u) => u.email !== user.email
  );

  const perFriendBalances = _(friends).map((friend) => {
    const perGroup = calculateBalancePerGroup(user, friend, transactions);
    const total = perGroup.sumBy('total');
    const lent = perGroup.sumBy('lent');
    const owed = perGroup.sumBy('owed');
    const totalBeforeSettlement = perGroup.sumBy('totalBeforeSettlement');
    const lentBeforeSettlement = perGroup.sumBy('lentBeforeSettlement');
    const owedBeforeSettlement = perGroup.sumBy('owedBeforeSettlement');
    return {
      friend,
      per_group: perGroup,
      total,
      lent,
      owed,
      lentBeforeSettlement,
      owedBeforeSettlement,
      totalBeforeSettlement,
    };
  });
  const lent = perFriendBalances.filter((f) => f.total > 0).sumBy('total');
  const owed = perFriendBalances.filter((f) => f.total < 0).sumBy('total');
  const total = lent - Math.abs(owed);
  const allBalancesV2 = {
    total,
    owed,
    lent,
    per_friend: perFriendBalances,
  };

  return JSON.parse(
    JSON.stringify(allBalancesV2)
  );
}

function calculateBalancePerGroup(user, friend, transactions) {
  const perGroupAmounts = _(transactions)
    .map((txn) => ({ groupId: txn.group.id, ...txn }))
    .groupBy('groupId')
    .map((txns, groupId) => {
      const { owedBeforeSettlement, settleUpByFriend } = calculateOwedAmountPerFriendInGroup(user, friend, txns);
      const { lentBeforeSettlement, settleUpByMe } = calculateLentAmountPerFriendInGroup(user, friend, txns);
      const lent = lentBeforeSettlement - settleUpByFriend;
      const owed = owedBeforeSettlement - settleUpByMe;
      return {
        owed,
        lent,
        settleUpByFriend,
        settleUpByMe,
        lentBeforeSettlement,
        owedBeforeSettlement,
        totalBeforeSettlement: lentBeforeSettlement - owedBeforeSettlement,
        total: lent - owed,
        groupId,
        group: txns[0].group,
      };
    });
  return perGroupAmounts;
}

function calculateOwedAmountPerFriendInGroup(user, friend, transactions) {
  const oweTxns = _(transactions)
    .filter((txn) => txn.from.email === friend.email)
    .filter((txn) => txn.to.map((u) => u.email).includes(user.email));
  const oweAmounts = oweTxns.map((txn) => ({
    id: txn.id,
    description: txn.description,
    oweAmount: convertAmount(
      txn.type === SETTLEUP_TXN ? 0 : txn.amount / (txn.to.length + 1),
      txn.currency_code,
      user.default_currency
    ),
    settleUpAmount: convertAmount(
      txn.type === SETTLEUP_TXN ? txn.amount : 0,
      txn.currency_code,
      user.default_currency
    ),
  }));

  return { owedBeforeSettlement: oweAmounts.sumBy((txn) => txn.oweAmount), settleUpByFriend: oweAmounts.sumBy((txn) => txn.settleUpAmount) };
}

function calculateLentAmountPerFriendInGroup(user, friend, transactions) {
  const lentTxns = _(transactions)
    .filter((txn) => txn.from.email === user.email)
    .filter((txn) => txn.to.map((u) => u.email).includes(friend.email));
  const lentAmounts = lentTxns.map((txn) => ({
    id: txn.id,
    description: txn.description,
    lentAmount: convertAmount(
      txn.type === SETTLEUP_TXN ? 0 : txn.amount / (txn.to.length + 1),
      txn.currency_code,
      user.default_currency
    ),
    settleUpAmount: convertAmount(
      txn.type === SETTLEUP_TXN ? txn.amount : 0,
      txn.currency_code,
      user.default_currency
    ),
  }));

  return { lentBeforeSettlement: lentAmounts.sumBy((txn) => txn.lentAmount), settleUpByMe: lentAmounts.sumBy((txn) => txn.settleUpAmount) };
}
