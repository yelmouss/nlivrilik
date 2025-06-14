"use client";
import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const socialLinks = [
	{
		href: "https://facebook.com",
		icon: <FacebookIcon />,
		color: "#1877F2",
		label: "Facebook",
	},
	{
		href: "https://twitter.com",
		icon: <TwitterIcon />,
		color: "#1DA1F2",
		label: "Twitter",
	},
	{
		href: "https://instagram.com",
		icon: <InstagramIcon />,
		color: "#E4405F",
		label: "Instagram",
	},
	{
		href: "https://linkedin.com",
		icon: <LinkedInIcon />,
		color: "#0A66C2",
		label: "LinkedIn",
	},
];

const SocialLinks = () => {
	const { scrollY } = useScroll();
	// Disappear after scrolling 200px, fully gone by 400px
	const opacity = useTransform(scrollY, [0, 200, 400], [1, 1, 0]);
	const y = useTransform(scrollY, [0, 200, 400], [0, 0, -200]); // Move up as it fades

	return (
		<motion.div
			style={{
				position: "fixed",
				left: "10px", // Adjust as needed
				top: "30%",
				transform: "translateY(-50%)",
				opacity,
				y,
				zIndex: 1000, // Ensure it's above other content
			}}
		>
			<Stack alignItems="center" spacing={1}>
				<Box
					sx={{
						width: "2px",
						height: "100px", // Adjust as needed
						backgroundColor: "primary.main", // Or any color you prefer
						mb: 1,
					}}
				/>
				{socialLinks.map((social) => (
					<IconButton
						key={social.label}
						href={social.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={social.label}
						sx={{
							backgroundColor: "background.paper", // Added background color
							color: social.color,
							width: 40, // Ensure circular shape
							height: 40, // Ensure circular shape
							"&:hover": {
								backgroundColor: "action.hover", // Standard hover from theme
							},
						}}
					>
						{social.icon}
					</IconButton>
				))}
			</Stack>
		</motion.div>
	);
};

export default SocialLinks;
