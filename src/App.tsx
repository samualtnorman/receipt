import { makePersisted } from "@solid-primitives/storage"
import { createSignal, For, Index } from "solid-js"
import { createStore } from "solid-js/store"

const intlGbp = new Intl.NumberFormat(`en-GB`, { style: `currency`, currency: `GBP` })

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

	const remainder = () => getTotal() - store.map(item => item.price).reduce((total, price) => total + price, 0)

	return <table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Price</th>

				<Index each={people}>
					{(getName, index) => <th>
						<input
							value={getName()}
							onInput={({ target }) => {
								setPeople(index, target.value)
							}}
						/>

						<button
							onClick={() => {
								setPeople(people => people.toSpliced(index, 1))
							}}
						>x</button>
					</th>}
				</Index>

				<td>
					<button
						onClick={() => {
							setPeople(people.length, `new person`)
						}}
					>+</button>
				</td>
			</tr>
		</thead>

		<tbody>
			<For each={store}>
				{(item, getIndex) => <tr>
					<td>
						<input
							value={item.name}
							onInput={({ target }) => {
								setStore(getIndex(), `name`, target.value)
							}}
						/>
					</td>

					<td>
						£
						<input
							type="number"
							value={item.price}
							onInput={({ target }) => {
								setStore(getIndex(), `price`, Number(target.value))
							}}
						/>
					</td>

					<For each={people}>
						{(_, getPersonIndex) => <td>
							<input
								type="checkbox"
								style={{ width: `100%` }}
								checked={!item.notPaying.includes(getPersonIndex())}
								onInput={({ target }) => {
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
						<button
							onClick={() => {
								setStore(store => store.toSpliced(getIndex(), 1))
							}}
						>x</button>
					</td>
				</tr>}
			</For>

			<tr>
				<th>Remainder</th>
				<td>{intlGbp.format(remainder())}</td>
				<td colSpan={people.length}/>

				<td>
					<button
						onClick={() => {
							setStore(store.length, { name: `new item`, price: 0, notPaying: [] })
						}}
					>+</button>
				</td>
			</tr>

			<tr>
				<th>Total</th>

				<td>
					£
					<input
						type="number"
						value={getTotal()}
						onInput={({ target }) => setTotal(Number(target.value))}
					/>
				</td>
			</tr>

			<tr>
				<th>Paying</th>

				<td/>
					<For each={people}>
					{(_, getIndex) => {
						const amPayingForAmount = () => store
							.filter(item => !item.notPaying.includes(getIndex()))
							.map(item => item.price / (people.length - item.notPaying.length))
							.reduce((total, price) => total + price, 0)

						return <td>{intlGbp.format((remainder() / people.length) + amPayingForAmount())}</td>
					}}
				</For>
			</tr>
		</tbody>
	</table>
}
