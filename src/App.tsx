import { makePersisted } from "@solid-primitives/storage"
import { createMemo, createSignal, For, Index } from "solid-js"
import { createStore } from "solid-js/store"

export const App = () => {
	const [ people, setPeople ] = makePersisted(createStore<string[]>([]), { name: `l8g7kqdrnJWq8ZqXNLcPq` })

	const [ store, setStore ] = makePersisted(
		createStore<{ name: string, price: number, notPaying: number[] }[]>([]),
		{
			name: `m1ZPcMH5j1LC5DVPz8Hcu`,
			deserialize: data => (JSON.parse(data) as { name: string, price: number, notPaying?: number[] }[])
				.map(item => ({ ...item, notPaying: item.notPaying || [] }))
		}
	)

	const [ getTotal, setTotal ] = makePersisted(createSignal(0), { name: `8Rjo6Old7rxDu1cKTPVRJ` })
	const [ getCurrency, setCurrency ] = makePersisted(createSignal(`GBP`), { name: `DbKTwaC56UBVLvWA6oZ8p` })
	const supportedCurrencies = Intl.supportedValuesOf(`currency`)
	const getCurrencyValidity = createMemo(() => supportedCurrencies.includes(getCurrency()))

	const getValidCurrency = createMemo((currency: string | undefined) => {
		if (getCurrencyValidity())
			return getCurrency()

		return currency || `GBP`
	})

	const remainder = () => getTotal() - store.map(item => item.price).reduce((total, price) => total + price, 0)

	const getIntlCurrency = createMemo(() => Intl.NumberFormat(
		undefined,
		{ style: `currency`, currency: getValidCurrency(), currencyDisplay: `narrowSymbol` }
	))

	// Credit: https://stackoverflow.com/a/53749034
	const getCurrencySymbol = createMemo(() => 0..toLocaleString(undefined, {
		style: 'currency',
		currency: getValidCurrency(),
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
		currencyDisplay: `narrowSymbol`
	}).replace(/\d/g, ``).trim())

	const [ remainderNotPayingFor, setRemainderNotPayingFor ] =
		makePersisted(createStore<number[]>([]), { name: `JlzuW9hb5JxDU-wHLYKPi` })

	return <>
		<label>
			Currency: {}
			<input value={getCurrency()} onInput={({ target }) => {
				setCurrency(target.value)
			}}/>
		</label>

		{getCurrencyValidity() ||
			<p style={{ color: `red` }}>Invalid currency code. Falling back to <code>{getValidCurrency()}</code>.</p>
		}

		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Price</th>

					<Index each={people}>
						{(getName, index) => <th>
							<input value={getName()} onInput={({ target }) => {
								setPeople(index, target.value)
							}}/>

							<button onClick={() => {
								setPeople(people => people.toSpliced(index, 1))
							}}>x</button>
						</th>}
					</Index>

					<td>
						<button onClick={() => {
							setPeople(people.length, `new person`)
						}}>+</button>
					</td>
				</tr>
			</thead>

			<tbody>
				<tr>
					<th>Total</th>

					<td>
						{getCurrencySymbol()}
						<input type="number" value={getTotal()} onInput={({ target }) => {
							setTotal(Number(target.value))
						}}/>
					</td>

					<td colSpan={people.length + 1}/>
				</tr>

				<For each={store}>
					{(item, getIndex) => <tr>
						<td>
							<input value={item.name} onInput={({ target }) => {
								setStore(getIndex(), `name`, target.value)
							}}/>
						</td>

						<td>
							{getCurrencySymbol()}
							<input type="number" value={item.price} onInput={({ target }) => {
								setStore(getIndex(), `price`, Number(target.value))
							}}/>
						</td>

						<For each={people}>
							{(_, getPersonIndex) => <td>
								<input
									type="checkbox"
									style={{ width: `100%` }}
									checked={!item.notPaying.includes(getPersonIndex())}
									onInput={() => {
										setStore(
											getIndex(),
											`notPaying`,
											indexes => {
												const indexIndex = indexes.indexOf(getPersonIndex())

												return indexIndex == -1
													? [ ...indexes, getPersonIndex() ]
													: indexes.toSpliced(indexIndex, 1)
											}
										)
									}}
								/>
							</td>}
						</For>

						<td>
							<button onClick={() => {
								setStore(store => store.toSpliced(getIndex(), 1))
							}}>x</button>
						</td>
					</tr>}
				</For>

				<tr>
					<th>Remainder</th>
					<td>{getIntlCurrency().format(remainder())}</td>

					<For each={people}>
						{(_, getPersonIndex) => <td>
							<input
								type="checkbox"
								style={{ width: `100%` }}
								checked={!remainderNotPayingFor.includes(getPersonIndex())}
								onInput={() => {
									setRemainderNotPayingFor(
										indexes => {
											const indexIndex = indexes.indexOf(getPersonIndex())

											return indexIndex == -1
												? [ ...indexes, getPersonIndex() ]
												: indexes.toSpliced(indexIndex, 1)
										}
									)
								}}
							/>
						</td>}
					</For>

					<td>
						<button onClick={() => {
							setStore(store.length, { name: `new item`, price: 0, notPaying: [] })
						}}>+</button>
					</td>
				</tr>

				<tr>
					<th>Paying</th>
					<td/>

					<For each={people}>
						{(_, getIndex) => {
							return <td>
								{getIntlCurrency().format(store
									.filter(item => !item.notPaying.includes(getIndex()))
									.map(item => item.price / (people.length - item.notPaying.length))
									.reduce(
										(total, price) => total + price,
										remainderNotPayingFor.includes(getIndex())
											? 0
											: remainder() / (people.length - remainderNotPayingFor.length)
									)
								)}
							</td>
						}}
					</For>

					<td/>
				</tr>
			</tbody>
		</table>
	</>
}
