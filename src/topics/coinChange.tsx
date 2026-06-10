import { defineViz, type StepBase, type Topic } from "../engine/types";
import { Cell, Row } from "../components/primitives";
import { C, FONT_MONO } from "../theme";

interface Step extends StepBase {
  dp: number[];
  amount: number; // cell being updated
  from: number; // dp[amount-coin] referenced
  coin: number;
}

const INF = 99;

function build(coins: number[], target: number) {
  const dp = Array(target + 1).fill(INF);
  dp[0] = 0;
  const steps: Step[] = [];
  const snap = (e: Partial<Step> & { caption: string }) =>
    steps.push({ dp: [...dp], amount: -1, from: -1, coin: -1, ...e });

  snap({ caption: `Fewest coins to make each amount 0..${target}. dp[0]=0, rest = ∞.` });
  for (const coin of coins) {
    snap({ coin, caption: `Use coin ${coin}: update every amount ≥ ${coin}.` });
    for (let a = coin; a <= target; a++) {
      if (dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1;
        snap({ amount: a, from: a - coin, coin, caption: `dp[${a}] = dp[${a - coin}] + 1 = ${dp[a]} (use a ${coin}).` });
      }
    }
  }
  snap({ caption: `Minimum coins for ${target} = ${dp[target]}. ✓` });
  return steps;
}

const CODE = `function coinChange(coins, amount) {
  const dp = Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins)
    for (let a = coin; a <= amount; a++)
      dp[a] = Math.min(dp[a], dp[a - coin] + 1);
  return dp[amount] === Infinity ? -1 : dp[amount];
}`;

export const coinChange: Topic = {
  id: "coin-change",
  title: "Coin Change (DP)",
  category: "Dynamic Programming",
  blurb: "Fewest coins to make an amount.",
  create: () => {
    const coins = [1, 3, 4];
    const target = 9;
    return defineViz<Step>({
      steps: build(coins, target),
      code: CODE,
      explanation:
        `Coins ${[1, 3, 4].join(", ")}. dp[a] = fewest coins to total a. For each coin we improve every amount by reusing dp[a − coin] + 1. Greedy can fail with these coins (for amount 6 it picks 4+1+1 = 3 coins, but 3+3 = 2 is optimal), so DP is needed to always find the optimum.\n\nTime: O(amount × coins) · Space: O(amount)`,
      renderStep: (s) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {s.coin >= 0 && <div style={{ fontFamily: FONT_MONO, color: C.active }}>active coin: {s.coin}</div>}
          <Row gap={6}>
            {s.dp.map((v, i) => (
              <Cell
                key={i}
                value={v >= INF ? "∞" : v}
                state={i === s.amount ? "active" : i === s.from ? "compare" : v < INF ? "sorted" : "muted"}
                size={50}
                sub={i}
              />
            ))}
          </Row>
        </div>
      ),
    });
  },
};
