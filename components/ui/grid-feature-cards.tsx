// Grid Feature Cards by efferd — https://21st.dev/@efferd/components/grid-feature-cards
// with the hover from Aceternity's Feature Section with hover effects —
// https://21st.dev/@manuarora700/components/feature-section-with-hover-effects
// Changes from efferd: no pixel-pattern background; Aceternity's hover glow
// instead (without its side bar or title slide).
import { cn } from '@/lib/utils';
import React from 'react';

type FeatureType = {
	title: string;
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	description: string;
};

type FeatureCardPorps = React.ComponentProps<'div'> & {
	feature: FeatureType;
	/** Which way the hover glow fades: up from the bottom edge, or down from the top (bottom row). */
	glow?: 'up' | 'down';
};

export function FeatureCard({ feature, glow = 'up', className, children, ...props }: FeatureCardPorps) {
	return (
		<div className={cn('group/feature relative overflow-hidden p-6', className)} {...props}>
			<div
				className={cn(
					'pointer-events-none absolute inset-0 h-full w-full from-neutral-100 to-transparent opacity-0 transition duration-200 group-hover/feature:opacity-100 dark:from-neutral-800',
					glow === 'up' ? 'bg-gradient-to-t' : 'bg-gradient-to-b',
				)}
			/>
			<feature.icon className="text-foreground/75 relative z-10 size-6" strokeWidth={1} aria-hidden />
			<div className="relative z-10 mt-10">
				<h3 className="text-sm md:text-base">
					{feature.title}
				</h3>
			</div>
			<p className="text-muted-foreground relative z-20 mt-2 text-xs font-light">{feature.description}</p>
			{children}
		</div>
	);
}
