'use client';

export function TrustedBySection() {
	const logos = [
		,
	];

	return (
		<section className="py-12 sm:py-16 lg:py-20 bg-black border-b border-white/10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<p className="text-center text-xs sm:text-sm text-gray-500 mb-8 sm:mb-12">
					{/* Trusted by universities, training institutes, and modern classrooms. */}
				</p>

				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8 items-center">
					{logos.map((logo, index) => (
						<div
							key={index}
							className="flex items-center justify-center h-12 sm:h-14 lg:h-16 px-3 sm:px-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
						>
							<span className="text-xs sm:text-sm text-gray-400 font-medium">{logo}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
