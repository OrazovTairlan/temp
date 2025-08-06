import React from 'react';
import { SvgIcon } from '@mui/material';

// Using the UK flag for English is a common convention
export const EnFlagIcon = (props) => (
  <SvgIcon viewBox="0 0 800 480" {...props}>
    <path fill="#012169" d="M0 0h800v480H0z" />
    <path fill="#FFF" d="m0 0 800 480m0-480L0 480" />
    <path stroke="#C8102E" strokeWidth="64" d="m0 0 800 480m0-480L0 480" />
    <path stroke="#FFF" strokeWidth="96" d="M400 0v480M0 240h800" />
    <path stroke="#C8102E" strokeWidth="64" d="M400 0v480M0 240h800" />
  </SvgIcon>
);

export const RuFlagIcon = (props) => (
  <SvgIcon viewBox="0 0 900 600" {...props}>
    <path fill="#fff" d="M0 0h900v300H0z" />
    <path fill="#d52b1e" d="M0 300h900v300H0z" />
    <path fill="#0039a6" d="M0 200h900v200H0z" />
  </SvgIcon>
);

export const KzFlagIcon = (props) => (
  <SvgIcon viewBox="0 0 600 300" {...props}>
    <path fill="#00b2a9" d="M0 0h600v300H0z" />
    <path fill="#fecb00" d="M300 150 a50 50 0 1 1 0 .01zm-20-65 40 10v110l-40 10zm-10-22-2 15-13-4zm62 15-2-15 15-4zM245 88l-15 4 2 15zm85 19 15-4-2-15zM228 120l-15 2 13 8zm131 10 15-2-13 8zM228 180l-15-2 13-8zm131-10 15 2-13-8zM245 212l-15-4 2-15zm85-19 15 4-2 15zM270 237l-10 2 4 13zm50-2-10-2-4 13zM280 73l2-15 13 4zm20-15 2 15-15 4z" />
    <path fill="#fecb00" d="M35 15h15v270H35a5 5 0 0 0-5 5v-280a5 5 0 0 1 5 5zm5 260h5v-250h-5zm0-255a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" />
  </SvgIcon>
);
