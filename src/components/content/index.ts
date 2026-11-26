/** 觀念說明與考題的 MDX 可以直接使用的元件（由章節頁傳給 <Content components={...} />） */
import M from './M.astro';
import Figure from './Figure.astro';
import LoopTriangle from './figures/LoopTriangle.astro';
import BigODefinition from './figures/BigODefinition.astro';
import GrowthChart from './figures/GrowthChart.astro';
import RecursionTree from './figures/RecursionTree.astro';
import MasterCases from './figures/MasterCases.astro';
import FileVsDbms from './figures/FileVsDbms.astro';
import ThreeSchema from './figures/ThreeSchema.astro';
import Independence from './figures/Independence.astro';
import DataModels from './figures/DataModels.astro';
import DbmsComponents from './figures/DbmsComponents.astro';

export const mdxComponents = { M, Figure, LoopTriangle, BigODefinition, GrowthChart, RecursionTree, MasterCases, FileVsDbms, ThreeSchema, Independence, DataModels, DbmsComponents };
