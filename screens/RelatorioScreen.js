import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Dimensions, ActivityIndicator, Image, Platform,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { FontAwesome5 } from '@expo/vector-icons';
import CustomAlert from '../src/components/CustomAlert';
import { useCustomAlert } from '../src/hooks/useCustomAlert';
import { useTheme } from '../src/contexts/ThemeContext';

const { width } = Dimensions.get('window');

// ── Cálculos baseados no manual Hologic Discovery QDR ──

function calculateTScore(idade, sexo, examType, roiData) {
  if (roiData && roiData.tScore != null) return roiData.tScore;
  let base = 0.5;
  const a = parseInt(idade) || 30;
  if (a > 30) base -= (a - 30) * 0.04;
  if (sexo === 'Feminino' && a > 50) base -= (a - 50) * 0.02;
  if (examType?.includes('Fêmur')) base -= 0.3;
  else if (examType?.includes('Punho')) base -= 0.1;
  else if (examType?.includes('Corpo Total')) base += 0.2;
  return Math.max(-4.5, Math.min(2.0, base));
}

function calculateBMD(t) { return Math.max(0.3, 1.0 + t * 0.12); }
function calculateZScore(t, idade) { return t + ((parseInt(idade)||30) - 30) * 0.015 + 0.3; }

function getClassification(t) {
  if (t >= -1) return { name: 'Normal', color: '#4CAF50', icon: 'check-circle', desc: 'Densidade mineral óssea dentro dos valores normais.' };
  if (t >= -2.5) return { name: 'Osteopenia', color: '#FFC107', icon: 'exclamation-triangle', desc: 'Densidade óssea abaixo do normal. Risco moderado de fraturas.' };
  if (t >= -3.5) return { name: 'Osteoporose', color: '#F44336', icon: 'times-circle', desc: 'Densidade mineral óssea significativamente reduzida. Alto risco de fraturas.' };
  return { name: 'Osteoporose Severa', color: '#B71C1C', icon: 'times-circle', desc: 'Osteoporose severa com densidade óssea criticamente baixa. Risco muito elevado de fraturas.' };
}

function getExamRegions(examType, tScore, bmd) {
  const v = () => (Math.random() - 0.5) * 0.1;
  const r = (b, t, a) => ({ bmd: b.toFixed(3), tScore: t.toFixed(1), area: typeof a === 'number' ? a.toFixed(2) : a });
  const type = examType || '';
  if (type.includes('Coluna')) return [
    { name: 'L1', ...r(bmd+v(), tScore+v(), 10.5+Math.random()*2) },
    { name: 'L2', ...r(bmd+0.02+v(), tScore+0.1+v(), 12+Math.random()*2) },
    { name: 'L3', ...r(bmd+0.03+v(), tScore+0.15+v(), 13.5+Math.random()*2) },
    { name: 'L4', ...r(bmd+0.01+v(), tScore+0.05+v(), 14+Math.random()*2) },
    { name: 'L1-L4', ...r(bmd, tScore, 50+Math.random()*5), isTotal: true },
  ];
  if (type.includes('Fêmur')) return [
    { name: 'Colo', ...r(bmd-0.05+v(), tScore-0.3+v(), 5+Math.random()) },
    { name: 'Trocânter', ...r(bmd+0.03+v(), tScore+0.2+v(), 10+Math.random()*2) },
    { name: 'Intertrocantérico', ...r(bmd+0.08+v(), tScore+0.4+v(), 18+Math.random()*3) },
    { name: 'Triângulo de Ward', ...r(bmd-0.1+v(), tScore-0.5+v(), 1.2+Math.random()*0.5) },
    { name: 'Fêmur Total', ...r(bmd, tScore, 33+Math.random()*5), isTotal: true },
  ];
  if (type.includes('Punho') || type.includes('Antebraço')) return [
    { name: 'Ultra Distal (UD)', ...r(bmd-0.02+v(), tScore-0.1+v(), 3.5+Math.random()) },
    { name: 'MID', ...r(bmd+0.05+v(), tScore+0.3+v(), 4+Math.random()) },
    { name: '1/3 Distal', ...r(bmd+0.08+v(), tScore+0.4+v(), 2.5+Math.random()) },
    { name: 'Total Antebraço', ...r(bmd, tScore, 10+Math.random()*2), isTotal: true },
  ];
  // Corpo Total
  return [
    { name: 'Cabeça', ...r(bmd+0.8+v(), tScore+1+v(), 220+Math.random()*20) },
    { name: 'Braço E', ...r(bmd-0.1+v(), tScore-0.5+v(), 180+Math.random()*20) },
    { name: 'Braço D', ...r(bmd-0.08+v(), tScore-0.4+v(), 185+Math.random()*20) },
    { name: 'Tronco', ...r(bmd+0.02+v(), tScore+0.1+v(), 600+Math.random()*50) },
    { name: 'Pelve', ...r(bmd+0.15+v(), tScore+0.5+v(), 220+Math.random()*30) },
    { name: 'Perna E', ...r(bmd+0.05+v(), tScore+0.2+v(), 350+Math.random()*30) },
    { name: 'Perna D', ...r(bmd+0.06+v(), tScore+0.25+v(), 355+Math.random()*30) },
    { name: 'Corpo Total', ...r(bmd, tScore, 2100+Math.random()*200), isTotal: true },
  ];
}

function generateChartSVG(tScore, idade, examType) {
  const w=500, h=190, pl=55, pr=55, pt=20, pb=38;
  const cw=w-pl-pr, ch=h-pt-pb;
  const ageMin=20, ageMax=100, tMin=-5, tMax=3;
  const gx=a=>pl+((a-ageMin)/(ageMax-ageMin))*cw;
  const gy=t=>pt+((tMax-t)/(tMax-tMin))*ch;
  const ref = (examType||'').includes('Fêmur')
    ? [[25,0.8],[35,0.5],[45,0.1],[55,-0.5],[65,-1.2],[75,-2.0],[85,-2.8],[95,-3.3]]
    : (examType||'').includes('Punho')
    ? [[25,0.6],[35,0.3],[45,-0.1],[55,-0.6],[65,-1.1],[75,-1.7],[85,-2.2],[95,-2.6]]
    : [[25,0.7],[35,0.4],[45,-0.1],[55,-0.7],[65,-1.3],[75,-1.9],[85,-2.4],[95,-2.8]];
  const path = ref.map(([a,t],i)=>`${i?'L':'M'}${gx(a).toFixed(1)},${gy(t).toFixed(1)}`).join(' ');
  const age = Math.max(ageMin, Math.min(ageMax, parseInt(idade)||30));
  const px=gx(age), py=gy(Math.max(tMin, Math.min(tMax, tScore)));
  const clr = tScore >= -1 ? '#4CAF50' : tScore >= -2.5 ? '#FFC107' : '#F44336';
  let grid='';
  for(let t=tMin;t<=tMax;t++){const y=gy(t);grid+=`<line x1="${pl}" y1="${y}" x2="${w-pr}" y2="${y}" stroke="#ddd" stroke-width="0.5" stroke-dasharray="4,4"/><text x="${pl-8}" y="${y+4}" text-anchor="end" font-size="10" fill="#666">${t}</text><text x="${w-pr+8}" y="${y+4}" text-anchor="start" font-size="10" fill="#666">${(1+t*0.12).toFixed(2)}</text>`;}
  for(let a=20;a<=100;a+=10){const x=gx(a);grid+=`<line x1="${x}" y1="${pt}" x2="${x}" y2="${h-pb}" stroke="#ddd" stroke-width="0.5" stroke-dasharray="4,4"/><text x="${x}" y="${h-pb+18}" text-anchor="middle" font-size="10" fill="#666">${a}</text>`;}
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="auto" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">
<rect x="${pl}" y="${gy(tMax)}" width="${cw}" height="${gy(-1)-gy(tMax)}" fill="rgba(76,175,80,0.25)"/>
<rect x="${pl}" y="${gy(-1)}" width="${cw}" height="${gy(-2.5)-gy(-1)}" fill="rgba(255,193,7,0.25)"/>
<rect x="${pl}" y="${gy(-2.5)}" width="${cw}" height="${gy(tMin)-gy(-2.5)}" fill="rgba(244,67,54,0.25)"/>
<line x1="${pl}" y1="${gy(-1)}" x2="${w-pr}" y2="${gy(-1)}" stroke="#FFC107" stroke-width="2"/>
<line x1="${pl}" y1="${gy(-2.5)}" x2="${w-pr}" y2="${gy(-2.5)}" stroke="#F44336" stroke-width="2"/>
<text x="${w-pr-5}" y="${(gy(tMax)+gy(-1))/2}" text-anchor="end" font-size="11" fill="#4CAF50" font-weight="bold">Normal</text>
<text x="${w-pr-5}" y="${(gy(-1)+gy(-2.5))/2}" text-anchor="end" font-size="11" fill="#E6A800" font-weight="bold">Osteopenia</text>
<text x="${w-pr-5}" y="${(gy(-2.5)+gy(tMin))/2}" text-anchor="end" font-size="11" fill="#F44336" font-weight="bold">Osteoporose</text>
${grid}
<line x1="${pl}" y1="${pt}" x2="${pl}" y2="${h-pb}" stroke="#333" stroke-width="2"/>
<line x1="${pl}" y1="${h-pb}" x2="${w-pr}" y2="${h-pb}" stroke="#333" stroke-width="2"/>
<text x="${w/2}" y="${h-5}" text-anchor="middle" font-size="12" fill="#333" font-weight="bold">Idade (anos)</text>
<text x="12" y="${h/2}" text-anchor="middle" font-size="12" fill="#333" font-weight="bold" transform="rotate(-90,12,${h/2})">T-Score</text>
<path d="${path}" stroke="#4A90E2" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<circle cx="${px}" cy="${py}" r="8" fill="${clr}" stroke="#fff" stroke-width="3"/>
<line x1="${px}" y1="${py+10}" x2="${px}" y2="${h-pb}" stroke="${clr}" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>
<line x1="${pl}" y1="${py}" x2="${px-10}" y2="${py}" stroke="${clr}" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.6"/>
</svg>`;
}

function generatePDFHTML(p) {
  const examTitle = {
    'Coluna Lombar':'COLUNA LOMBAR (AP L1-L4)',
    'Fêmur (Proximal)':'FÊMUR PROXIMAL',
    'Fêmur':'FÊMUR PROXIMAL',
    'Punho (Antebraço)':'ANTEBRAÇO / PUNHO',
    'Punho':'ANTEBRAÇO / PUNHO',
    'Corpo Total (Full Body)':'CORPO TOTAL',
    'Corpo Total':'CORPO TOTAL',
  }[p.exame] || 'DENSITOMETRIA ÓSSEA';
  const examMethod = {
    'Coluna Lombar':'AP Spine (L1-L4)','Fêmur (Proximal)':'Left Femur','Fêmur':'Left Femur',
    'Punho (Antebraço)':'Forearm','Punho':'Forearm',
    'Corpo Total (Full Body)':'Whole Body','Corpo Total':'Whole Body',
  }[p.exame] || 'Standard';

  const rows = p.regions.map(r => {
    const bmc = r.bmc != null ? r.bmc : (parseFloat(r.bmd) * parseFloat(r.area || 10)).toFixed(2);
    const tVal = parseFloat(r.tScore);
    const tColor = tVal >= -1 ? '#2E7D32' : tVal >= -2.5 ? '#E65100' : '#C62828';
    const zVal = r.zScore != null ? r.zScore : calculateZScore(tVal, p.idade).toFixed(1);
    return `<tr class="${r.isTotal ? 'total-row' : ''}">
      <td class="region-name">${r.name}</td>
      <td class="num">${r.area}</td>
      <td class="num">${bmc}</td>
      <td class="num bmd-val">${r.bmd}</td>
      <td class="num" style="color:${tColor};font-weight:700">${r.tScore}</td>
      <td class="num">${zVal}</td>
    </tr>`;
  }).join('');

  const recItems = p.classification.name === 'Normal'
    ? ['Densidade mineral óssea dentro dos valores normais para a idade e sexo do paciente.',
       'Manter ingestão adequada de cálcio (1000-1200 mg/dia) e vitamina D (800-1000 UI/dia).',
       'Manter atividade física regular com exercícios de impacto e fortalecimento muscular.',
       'Reavaliar conforme indicação clínica, em 2 a 3 anos.']
    : p.classification.name === 'Osteopenia'
    ? ['Massa óssea reduzida (Osteopenia) de acordo com critérios da OMS.',
       'Recomenda-se suplementação de cálcio (1200-1500 mg/dia) e vitamina D (1000-2000 UI/dia).',
       'Avaliação de fatores de risco para fratura (considerar ferramenta FRAX®).',
       'Exercícios de fortalecimento muscular e equilíbrio.',
       'Reavaliar em 1 a 2 anos para monitoramento da evolução.']
    : p.classification.name === 'Osteoporose Severa'
    ? ['Osteoporose severa diagnosticada conforme critérios da OMS (T-Score ≤ -3.5).',
       '<strong>Encaminhamento prioritário ao especialista para tratamento imediato.</strong>',
       'Indicação de tratamento farmacológico (bisfosfonatos, denosumabe, teriparatida).',
       'Suplementação obrigatória de cálcio e vitamina D.',
       'Programa intensivo de prevenção de quedas e reabilitação.',
       'Investigar causas secundárias de osteoporose.',
       'Reavaliar em 12 meses.']
    : ['Osteoporose diagnosticada conforme critérios da OMS (T-Score ≤ -2.5).',
       '<strong>Consulta com especialista recomendada para avaliação terapêutica.</strong>',
       'Considerar tratamento medicamentoso (bisfosfonatos, teriparatida, denosumabe).',
       'Suplementação de cálcio (1200-1500 mg/dia) e vitamina D (1000-2000 UI/dia).',
       'Exercícios supervisionados e prevenção de quedas.',
       'Reavaliar em 1 a 2 anos para acompanhamento.'];

  const bmiVal = p.peso && p.altura ? (parseFloat(p.peso) / Math.pow(parseFloat(p.altura) / 100, 2)).toFixed(1) : null;
  const bmiLabel = bmiVal ? (bmiVal < 18.5 ? 'Abaixo do peso' : bmiVal < 25 ? 'Normal' : bmiVal < 30 ? 'Sobrepeso' : 'Obesidade') : null;

  const diagClass = p.classification.name === 'Normal' ? 'normal'
    : p.classification.name === 'Osteopenia' ? 'osteopenia'
    : p.classification.name === 'Osteoporose Severa' ? 'severa' : 'osteoporose';
  const diagBorder = p.classification.name === 'Normal' ? '#2E7D32'
    : p.classification.name === 'Osteopenia' ? '#F57F17'
    : p.classification.name === 'Osteoporose Severa' ? '#B71C1C' : '#C62828';
  const diagBg = p.classification.name === 'Normal' ? '#E8F5E9'
    : p.classification.name === 'Osteopenia' ? '#FFF8E1'
    : p.classification.name === 'Osteoporose Severa' ? '#FFCDD2' : '#FFEBEE';
  const tColor = parseFloat(p.tScore) >= -1 ? '#2E7D32' : parseFloat(p.tScore) >= -2.5 ? '#E65100' : '#C62828';

  // Image section — side-by-side with chart if available, otherwise chart takes full width
  const scanImgBlock = p.imagemCustomizada
    ? `<div style="flex:1;min-width:0;text-align:center;background:#111;border-radius:6px;padding:5px;display:flex;align-items:center;justify-content:center;">
        <img src="${p.imagemCustomizada}" style="max-width:100%;max-height:165px;border-radius:4px;object-fit:contain;" />
       </div>`
    : '';

  const chartBlock = `<div style="flex:1;min-width:0;background:#fafafa;border:1px solid #ddd;border-radius:6px;padding:8px;text-align:center;overflow:hidden;">
    ${p.chartSVG}
    <div style="font-size:7px;color:#777;margin-top:3px;">● Paciente &nbsp; ─ Curva de referência &nbsp; Zonas: Normal / Osteopenia / Osteoporose</div>
  </div>`;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<style>
  @page { size: A4; margin: 7mm 10mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; font-size:9px; color:#1a1a1a; line-height:1.25; }

  /* ── HEADER ── */
  .hdr { border-bottom:2px solid #1565C0; padding-bottom:5px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:flex-start; }
  .hdr-left h1 { font-size:14px; color:#1565C0; font-weight:800; letter-spacing:1px; }
  .hdr-left h2 { font-size:9px; color:#666; font-weight:400; margin-top:1px; }
  .hdr-right { text-align:right; font-size:8px; color:#555; }
  .hdr-right .exam-type { font-size:12px; font-weight:700; color:#1565C0; margin-bottom:1px; }
  .edu-badge { display:inline-block; background:#FFF3E0; color:#E65100; padding:1px 6px; border-radius:3px; font-size:7px; font-weight:700; border:1px solid #FF9800; margin-top:3px; }

  /* ── PATIENT TABLE ── */
  .pt { width:100%; border-collapse:collapse; margin-bottom:6px; border:1px solid #bbb; }
  .pt th { background:#1565C0; color:#fff; padding:3px 6px; font-size:8px; text-align:left; font-weight:600; letter-spacing:0.5px; }
  .pt td { padding:2px 6px; border-bottom:1px solid #e5e5e5; font-size:9px; }
  .pt td.lbl { color:#555; font-weight:600; font-size:8px; text-transform:uppercase; letter-spacing:0.3px; width:20%; background:#f7f9fc; border-right:1px solid #ddd; }
  .pt tr:last-child td { border-bottom:none; }

  /* ── METRIC CARDS ── */
  .mc-row { display:flex; gap:5px; margin-bottom:6px; }
  .mc { flex:1; text-align:center; padding:5px 4px; border:1px solid #ddd; border-radius:5px; background:#fafafa; }
  .mc .lbl { font-size:7px; color:#888; text-transform:uppercase; letter-spacing:0.8px; font-weight:600; }
  .mc .val { font-size:18px; font-weight:800; margin:2px 0 1px; }
  .mc .unt { font-size:7px; color:#aaa; }

  /* ── SECTION HEADER ── */
  .sh { font-size:9px; font-weight:700; color:#1565C0; text-transform:uppercase; letter-spacing:0.8px; border-bottom:2px solid #1565C0; padding-bottom:2px; margin: 6px 0 4px; }

  /* ── RESULTS TABLE ── */
  .rt { width:100%; border-collapse:collapse; margin-bottom:6px; border:1px solid #bbb; }
  .rt th { background:#1565C0; color:#fff; padding:4px 5px; font-size:8px; text-align:center; font-weight:600; text-transform:uppercase; letter-spacing:0.4px; }
  .rt th:first-child { text-align:left; }
  .rt td { padding:3px 5px; border-bottom:1px solid #e0e0e0; font-size:9px; text-align:center; font-family:'Courier New',monospace; }
  .rt td:first-child { text-align:left; font-family:inherit; font-weight:500; }
  .rt .tr { background:#E3F2FD; }
  .rt .tr td { border-top:2px solid #1565C0; font-weight:700; }

  /* ── IMAGE + CHART ROW ── */
  .img-chart-row { display:flex; gap:7px; margin-bottom:6px; align-items:stretch; }

  /* ── CLASSIFICATION ── */
  .cls { padding:5px 8px; border-radius:4px; border-left:4px solid; margin-bottom:5px; }
  .cls .cls-title { font-size:11px; font-weight:700; margin-bottom:2px; }
  .cls .cls-desc { font-size:8.5px; color:#444; line-height:1.35; }
  .cls .cls-vals { font-size:9px; margin-top:3px; color:#222; }

  /* ── OMS TABLE ── */
  .oms { width:100%; border-collapse:collapse; font-size:8px; }
  .oms th { background:#E3F2FD; color:#1565C0; padding:3px 6px; text-align:left; font-size:7px; }
  .oms td { padding:2px 6px; border-bottom:1px solid #eee; }
  .oms .cur { background:#FFF9C4; font-weight:700; }

  /* ── RECOMMENDATIONS ── */
  .rec { background:#F5F5F5; padding:5px 8px; border-radius:4px; margin-bottom:6px; }
  .rec ul { margin-left:12px; }
  .rec li { margin-bottom:1px; font-size:9px; line-height:1.3; }

  /* ── SIGNATURE ── */
  .sig-row { display:flex; justify-content:space-between; margin-top:8px; padding-top:4px; }
  .sig-box { text-align:center; width:44%; }
  .sig-line { border-top:1px solid #555; margin-top:22px; padding-top:3px; }
  .sig-name { font-size:9px; font-weight:600; }
  .sig-role { font-size:8px; color:#666; }

  /* ── DISCLAIMER / FOOTER ── */
  .disc { background:#FFF3E0; border:1px solid #FF9800; border-radius:3px; padding:4px 8px; margin-top:6px; font-size:7.5px; color:#6D4C00; line-height:1.4; }
  .disc strong { font-size:8px; }
  .ftr { border-top:1px solid #1565C0; padding-top:4px; margin-top:5px; font-size:7.5px; color:#999; text-align:center; }
  .ftr .brand { font-weight:700; color:#1565C0; font-size:8px; }

  @media print { body { padding:0; } }
</style></head><body>

<!-- ═══ HEADER ═══ -->
<div class="hdr">
  <div class="hdr-left">
    <h1>DENSITOMETRIA ÓSSEA</h1>
    <h2>Absorciometria de Raios-X de Dupla Energia (DXA)</h2>
    <div class="edu-badge">⚠ SIMULAÇÃO EDUCACIONAL — SEM VALIDADE CLÍNICA</div>
  </div>
  <div class="hdr-right">
    <div class="exam-type">${examTitle}</div>
    <div>Data: ${p.dataAtual} — ${p.horaAtual}</div>
    <div>Equipamento: Hologic Discovery QDR (Simulado)</div>
    <div>Método: ${examMethod}</div>
  </div>
</div>

<!-- ═══ PATIENT DATA ═══ -->
<table class="pt">
  <thead><tr><th colspan="4">DADOS DO PACIENTE</th></tr></thead>
  <tbody>
    <tr>
      <td class="lbl">Paciente</td><td>${p.nome || '—'}</td>
      <td class="lbl">Data de Nasc.</td><td>${p.dataNascimento || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">Idade</td><td>${p.idade ? p.idade + ' anos' : '—'}</td>
      <td class="lbl">Sexo</td><td>${p.sexo || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">Etnia</td><td>${p.etnia || '—'}</td>
      <td class="lbl">Operador</td><td>${p.operador || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">Peso</td><td>${p.peso ? p.peso + ' kg' : '—'}</td>
      <td class="lbl">Altura</td><td>${p.altura ? p.altura + ' cm' : '—'}</td>
    </tr>
    ${bmiVal ? `<tr><td class="lbl">IMC</td><td colspan="3">${bmiVal} kg/m² — ${bmiLabel}</td></tr>` : ''}
  </tbody>
</table>

<!-- ═══ KEY METRICS ═══ -->
<div class="sh">RESULTADO PRINCIPAL</div>
<div class="mc-row">
  <div class="mc">
    <div class="lbl">BMD</div>
    <div class="val" style="color:#1565C0">${p.bmd.toFixed(3)}</div>
    <div class="unt">g/cm²</div>
  </div>
  <div class="mc">
    <div class="lbl">T-Score</div>
    <div class="val" style="color:${tColor}">${p.tScore.toFixed(1)}</div>
    <div class="unt">Desvios padrão</div>
  </div>
  <div class="mc">
    <div class="lbl">Z-Score</div>
    <div class="val" style="color:#1565C0">${p.zScore.toFixed(1)}</div>
    <div class="unt">Desvios padrão</div>
  </div>
  <div class="mc" style="border-color:${diagBorder};background:${diagBg}">
    <div class="lbl">Classificação OMS</div>
    <div class="val" style="color:${diagBorder};font-size:14px">${p.classification.name}</div>
    <div class="unt">WHO Criteria</div>
  </div>
</div>

<!-- ═══ SCAN IMAGE + CHART SIDE BY SIDE ═══ -->
<div class="sh">${p.imagemCustomizada ? 'IMAGEM DO EXAME &amp; GRÁFICO DE REFERÊNCIA' : 'GRÁFICO DE REFERÊNCIA'}</div>
<div class="img-chart-row">
  ${scanImgBlock}
  ${chartBlock}
</div>

<!-- ═══ REGIONAL RESULTS TABLE ═══ -->
<div class="sh">RESULTADOS POR REGIÃO ANATÔMICA</div>
<table class="rt">
  <thead>
    <tr>
      <th style="text-align:left;width:26%">Região</th>
      <th style="width:13%">Área (cm²)</th>
      <th style="width:13%">BMC (g)</th>
      <th style="width:15%">BMD (g/cm²)</th>
      <th style="width:16%">T-Score</th>
      <th style="width:17%">Z-Score</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>

<!-- ═══ CLASSIFICATION + OMS ═══ -->
<div style="display:flex;gap:8px;margin-bottom:6px;">
  <div style="flex:1.5">
    <div class="sh">CLASSIFICAÇÃO / DIAGNÓSTICO</div>
    <div class="cls" style="border-color:${diagBorder};background:${diagBg}">
      <div class="cls-title" style="color:${diagBorder}">${p.classification.name}</div>
      <div class="cls-desc">${p.classification.desc}</div>
      <div class="cls-vals">
        <strong>T-Score: ${p.tScore.toFixed(1)}</strong> &nbsp;·&nbsp;
        <strong>Z-Score: ${p.zScore.toFixed(1)}</strong> &nbsp;·&nbsp;
        <strong>BMD: ${p.bmd.toFixed(3)} g/cm²</strong>
      </div>
    </div>
  </div>
  <div style="flex:1">
    <div class="sh">CRITÉRIOS OMS</div>
    <table class="oms">
      <thead><tr><th>Classificação</th><th>T-Score</th></tr></thead>
      <tbody>
        <tr class="${p.tScore >= -1 ? 'cur' : ''}"><td>Normal</td><td>≥ -1.0</td></tr>
        <tr class="${p.tScore < -1 && p.tScore >= -2.5 ? 'cur' : ''}"><td>Osteopenia</td><td>-1.0 a -2.5</td></tr>
        <tr class="${p.tScore < -2.5 && p.tScore >= -3.5 ? 'cur' : ''}"><td>Osteoporose</td><td>≤ -2.5</td></tr>
        <tr class="${p.tScore < -3.5 ? 'cur' : ''}"><td>Osteoporose Severa</td><td>≤ -2.5 + fratura</td></tr>
      </tbody>
    </table>
  </div>
</div>

<!-- ═══ RECOMMENDATIONS ═══ -->
<div class="sh">RECOMENDAÇÕES CLÍNICAS</div>
<div class="rec">
  <ul>${recItems.map(r => `<li>${r}</li>`).join('')}</ul>
</div>

<!-- ═══ SIGNATURES ═══ -->
<div class="sig-row">
  <div class="sig-box">
    <div class="sig-line"></div>
    <div class="sig-name">${p.operador || 'Operador(a)'}</div>
    <div class="sig-role">Técnico(a) em Radiologia / DXA</div>
  </div>
  <div class="sig-box">
    <div class="sig-line"></div>
    <div class="sig-name">Médico(a) Responsável</div>
    <div class="sig-role">CRM: _________________</div>
  </div>
</div>

<!-- ═══ DISCLAIMER ═══ -->
<div class="disc">
  <strong>⚠ DOCUMENTO EXCLUSIVAMENTE EDUCACIONAL — SEM VALIDADE CLÍNICA</strong><br/>
  Relatório gerado pelo Bone Densitometry Simulator para fins didáticos e de treinamento.
  Os valores são simulados e NÃO possuem validade diagnóstica.
  NÃO substitui exame real realizado em equipamento certificado. Referências: OMS, ISCD, NOF, Hologic Discovery™ QDR® Series.
</div>

<!-- ═══ FOOTER ═══ -->
<div class="ftr">
  <div class="brand">BONE DENSITOMETRY SIMULATOR v1.0</div>
  <div>Simulação Educacional · ${p.dataAtual} ${p.horaAtual} · baseado no Hologic Discovery™ QDR® Series</div>
</div>

</body></html>`;
}

// ── Componente Principal ──

export default function RelatorioScreen({ route, navigation }) {
  const {
    nome, idade, dataNascimento, peso, altura, sexo, etnia, exame,
    operador, imagemCustomizada, imagemHash, id,
    vertebraSelecionada, brightness = 100, contrast = 100, roiData, allRoiData,
  } = route.params;

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [resolvedImageUri, setResolvedImageUri] = useState(
    imagemCustomizada?.startsWith('data:') ? imagemCustomizada : null
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const { alertConfig, showAlert, hideAlert } = useCustomAlert();
  const { theme } = useTheme();

  // Resolve image with same fallback logic as ExameDetalhesScreen
  useEffect(() => {
    const resolveImage = async () => {
      if (imagemCustomizada?.startsWith('data:')) { setResolvedImageUri(imagemCustomizada); return; }
      if (imagemHash) {
        try {
          const { buscarImagemPorHash } = require('../utils/storage');
          const imgData = await buscarImagemPorHash(imagemHash);
          if (imgData?.uri?.startsWith('data:')) { setResolvedImageUri(imgData.uri); return; }
        } catch (e) {}
      }
      if (id) {
        try {
          const { carregarPacientes } = require('../utils/storage');
          const lista = await carregarPacientes();
          const pac = lista.find(p => p.id === id);
          if (pac?.imagemCustomizada?.startsWith('data:')) { setResolvedImageUri(pac.imagemCustomizada); return; }
        } catch (e) {}
      }
      setResolvedImageUri(null);
    };
    resolveImage();
  }, [imagemCustomizada, imagemHash, id]);

  const tScore = calculateTScore(idade, sexo, exame, roiData);
  const bmd = roiData?.bmd || calculateBMD(tScore);
  const zScore = roiData?.zScore || calculateZScore(tScore, idade);
  const classification = getClassification(tScore);
  const imc = peso && altura ? (parseFloat(peso)/Math.pow(parseFloat(altura)/100,2)).toFixed(1) : null;

  // Use real ROI data from operator placement when available, otherwise fall back to simulated
  const regions = (allRoiData && allRoiData.length > 0)
    ? allRoiData.map(r => ({
        name: r.id || r.name || r.descricao,
        bmd: (r.bmd != null ? r.bmd : calculateBMD(r.tScore || tScore)).toFixed(3),
        tScore: (r.tScore != null ? r.tScore : tScore).toFixed(1),
        zScore: r.zScore != null ? r.zScore.toFixed(1) : calculateZScore(r.tScore || tScore, idade).toFixed(1),
        area: r.area != null ? r.area.toFixed(2) : '-',
        bmc: r.bmc != null ? r.bmc.toFixed(2) : undefined,
        isTotal: (r.id || r.name || '').toLowerCase().includes('total') || (r.id || r.name || '').includes('L1-L4'),
      }))
    : getExamRegions(exame, tScore, bmd);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const gerarEBaixarPDF = async () => {
    setIsGeneratingPDF(true);
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const chartSVG = generateChartSVG(tScore, idade, exame);
    const html = generatePDFHTML({
      nome, idade, dataNascimento, peso, altura, sexo, etnia, exame,
      operador, imagemCustomizada: resolvedImageUri, roiData, tScore, bmd, zScore, classification, regions,
      chartSVG, dataAtual, horaAtual,
    });
    try {
      if (Platform.OS === 'web') {
        // expo-print does not reliably use the html param on web — open in new window instead
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          // Small delay so images/styles load before print dialog opens
          setTimeout(() => { printWindow.print(); }, 600);
        }
        setIsGeneratingPDF(false);
      } else {
        const { uri } = await Print.printToFileAsync({ html, base64: false });
        const fileName = `Densitometria_${(nome||'Paciente').replace(/\s+/g,'_')}_${(exame||'').replace(/[\s()\/]/g,'_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        const newUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.moveAsync({ from: uri, to: newUri });
        setIsGeneratingPDF(false);
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(newUri, { mimeType: 'application/pdf', dialogTitle: 'Salvar Relatório', UTI: 'com.adobe.pdf' });
        } else {
          showAlert({ title: 'PDF Gerado', message: 'Salvo em: '+newUri, type: 'success', buttons: [{ text: 'OK' }] });
        }
      }
    } catch (error) {
      setIsGeneratingPDF(false);
      showAlert({ title: 'Erro', message: 'Não foi possível gerar o PDF.', type: 'error', buttons: [{ text: 'OK' }] });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.header, { backgroundColor: theme.surface, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: theme.surface }]} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Relatório do Exame</Text>
        <View style={{ width: 40 }} />
      </Animated.View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.cardH, { borderBottomColor: theme.border }]}><FontAwesome5 name="user-circle" size={20} color="#4A90E2" /><Text style={[styles.cardT, { color: theme.text }]}>Dados do Paciente</Text></View>
            <View style={styles.cardC}>
              <View style={styles.iGrid}>
                <IItem icon="user" label="Paciente" value={nome} />
                <IItem icon="birthday-cake" label="Idade" value={idade?`${idade} anos`:'—'} />
                <IItem icon="venus-mars" label="Sexo" value={sexo} />
                <IItem icon="globe-americas" label="Etnia" value={etnia} />
              </View>
              {(peso||altura)&&<View style={[styles.iGrid,{marginTop:8}]}>
                {peso&&<IItem icon="weight" label="Peso" value={`${peso} kg`} />}
                {altura&&<IItem icon="ruler-vertical" label="Altura" value={`${altura} cm`} />}
                {imc&&<IItem icon="calculator" label="IMC" value={`${imc} kg/m²`} />}
              </View>}
            </View>
          </View>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.cardH, { borderBottomColor: theme.border }]}><FontAwesome5 name="x-ray" size={20} color="#4A90E2" /><Text style={[styles.cardT, { color: theme.text }]}>Exame: {exame}</Text></View>
            <View style={styles.cardC}>
              <View style={styles.iGrid}>
                {operador&&<IItem icon="user-md" label="Operador" value={operador} />}
                <IItem icon="map-marker-alt" label="Região" value={roiData?.id||vertebraSelecionada||'—'} />
              </View>
            </View>
          </View>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.cardH, { borderBottomColor: theme.border }]}><FontAwesome5 name="chart-bar" size={20} color={classification.color} /><Text style={[styles.cardT, { color: theme.text }]}>Resultados DXA</Text></View>
            <View style={styles.cardC}>
              <View style={styles.mRow}>
                <MBox label="BMD" value={bmd.toFixed(3)} unit="g/cm²" color="#4A90E2" />
                <MBox label="T-Score" value={tScore.toFixed(1)} unit="SD" color={classification.color} />
                <MBox label="Z-Score" value={zScore.toFixed(1)} unit="SD" color="#2196F3" />
              </View>
              <View style={[styles.badge,{borderColor:classification.color,backgroundColor:classification.color+'20'}]}>
                <FontAwesome5 name={classification.icon} size={18} color={classification.color} />
                <Text style={[styles.badgeT,{color:classification.color}]}>{classification.name}</Text>
              </View>
              <Text style={[styles.desc, { color: theme.textMuted }]}>{classification.desc}</Text>
            </View>
          </View>
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.cardH, { borderBottomColor: theme.border }]}><FontAwesome5 name="table" size={20} color="#4A90E2" /><Text style={[styles.cardT, { color: theme.text }]}>Regiões</Text></View>
            <View style={styles.cardC}>
              <View style={[styles.tHead, { backgroundColor: theme.background }]}><Text style={[styles.tHT,{flex:2}]}>Região</Text><Text style={styles.tHT}>Área</Text><Text style={styles.tHT}>BMD</Text><Text style={styles.tHT}>T-Score</Text><Text style={styles.tHT}>Z-Score</Text></View>
              {regions.map((r,i)=><View key={i} style={[styles.tRow,{ borderBottomColor: theme.border },r.isTotal&&styles.tRowT]}>
                <Text style={[styles.tCell,{ color: theme.textSecondary },{flex:2,fontWeight:r.isTotal?'700':'400'}]}>{r.name}</Text>
                <Text style={[styles.tCell, { color: theme.textSecondary }]}>{r.area}</Text>
                <Text style={[styles.tCell, { color: theme.textSecondary }]}>{r.bmd}</Text>
                <Text style={[styles.tCell,{color:parseFloat(r.tScore)>=-1?'#66BB6A':parseFloat(r.tScore)>=-2.5?'#FFCA28':'#EF5350',fontWeight:'600'}]}>{r.tScore}</Text>
                <Text style={styles.tCell}>{r.zScore != null ? (typeof r.zScore === 'number' ? r.zScore.toFixed(1) : r.zScore) : calculateZScore(parseFloat(r.tScore), idade).toFixed(1)}</Text>
              </View>)}
            </View>
          </View>
          {resolvedImageUri&&<View style={[styles.card, { backgroundColor: theme.surface }]}>
            <View style={[styles.cardH, { borderBottomColor: theme.border }]}><FontAwesome5 name="image" size={20} color="#4A90E2" /><Text style={[styles.cardT, { color: theme.text }]}>Imagem do Exame</Text></View>
            <View style={styles.imgSec}><Image source={{uri:resolvedImageUri}} style={styles.examImg} resizeMode="contain" /></View>
          </View>}
          <TouchableOpacity style={[styles.pdfBtn,isGeneratingPDF&&{opacity:0.6}]} onPress={gerarEBaixarPDF} disabled={isGeneratingPDF} activeOpacity={0.8}>
            {isGeneratingPDF?<><ActivityIndicator size="small" color="#FFF" /><Text style={styles.pdfBtnT}>Gerando PDF...</Text></>
            :<><FontAwesome5 name="file-download" size={20} color="#FFF" /><Text style={styles.pdfBtnT}>Baixar Relatório PDF</Text></>}
          </TouchableOpacity>
          <View style={styles.eduWarn}><FontAwesome5 name="graduation-cap" size={14} color="#856404" /><Text style={styles.eduWarnT}>Relatório educacional. Valores simulados sem validade clínica.</Text></View>
          <TouchableOpacity style={styles.homeBtn} onPress={()=>navigation.navigate('Home')} activeOpacity={0.8}>
            <FontAwesome5 name="home" size={18} color="#FFF" /><Text style={styles.homeBtnT}>Voltar ao Início</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      <CustomAlert {...alertConfig} onDismiss={hideAlert} />
    </View>
  );
}

const IItem=({icon,label,value})=>{
  const { theme } = useTheme();
  return (
    <View style={[styles.iItem, { backgroundColor: theme.background }]}><FontAwesome5 name={icon} size={13} color="#4A90E2" /><View><Text style={[styles.iLabel, { color: theme.textMuted }]}>{label}</Text><Text style={[styles.iValue, { color: theme.text }]}>{value||'—'}</Text></View></View>
  );
};
const MBox=({label,value,unit,color})=>{
  const { theme } = useTheme();
  return (
    <View style={[styles.mBox, { backgroundColor: theme.background }]}><Text style={[styles.mLabel, { color: theme.textMuted }]}>{label}</Text><Text style={[styles.mValue,{color}]}>{value}</Text><Text style={[styles.mUnit, { color: theme.textFaint }]}>{unit}</Text></View>
  );
};

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#1a1d29'},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingTop:50,paddingHorizontal:20,paddingBottom:16},
  backBtn:{width:40,height:40,borderRadius:20,backgroundColor:'#2a3142',justifyContent:'center',alignItems:'center'},
  title:{fontSize:20,fontWeight:'700',color:'#FFF'},
  scroll:{flex:1},scrollContent:{paddingHorizontal:16,paddingBottom:40},
  card:{backgroundColor:'#2a3142',borderRadius:12,marginBottom:14,overflow:'hidden'},
  cardH:{flexDirection:'row',alignItems:'center',padding:14,borderBottomWidth:1,borderBottomColor:'#3a3f52',gap:10},
  cardT:{fontSize:15,fontWeight:'600',color:'#FFF'},
  cardC:{padding:14},
  iGrid:{flexDirection:'row',flexWrap:'wrap',gap:8},
  iItem:{flexDirection:'row',alignItems:'center',gap:8,backgroundColor:'#1a1d29',padding:10,borderRadius:8,minWidth:'45%',flex:1},
  iLabel:{fontSize:10,color:'#999',textTransform:'uppercase',letterSpacing:0.5},
  iValue:{fontSize:13,color:'#FFF',fontWeight:'600',marginTop:2},
  mRow:{flexDirection:'row',gap:10,marginBottom:14},
  mBox:{flex:1,backgroundColor:'#1a1d29',padding:14,borderRadius:10,alignItems:'center'},
  mLabel:{fontSize:10,color:'#999',textTransform:'uppercase',letterSpacing:0.5,marginBottom:4},
  mValue:{fontSize:22,fontWeight:'700'},
  mUnit:{fontSize:9,color:'#666',marginTop:3},
  badge:{flexDirection:'row',alignItems:'center',justifyContent:'center',padding:12,borderRadius:10,borderWidth:1.5,gap:10,marginBottom:8},
  badgeT:{fontSize:16,fontWeight:'700',textTransform:'uppercase',letterSpacing:1},
  desc:{fontSize:12,color:'#aaa',textAlign:'center',lineHeight:18},
  tHead:{flexDirection:'row',backgroundColor:'#1a1d29',padding:10,borderRadius:6,marginBottom:4},
  tHT:{flex:1,fontSize:11,fontWeight:'700',color:'#4A90E2',textAlign:'center'},
  tRow:{flexDirection:'row',padding:10,borderBottomWidth:1,borderBottomColor:'#3a3f52'},
  tRowT:{backgroundColor:'rgba(74,144,226,0.1)',borderRadius:6},
  tCell:{flex:1,fontSize:12,color:'#ddd',textAlign:'center'},
  imgSec:{padding:14,alignItems:'center',backgroundColor:'#000'},
  examImg:{width:'100%',height:350,maxWidth:400,borderRadius:8},
  pdfBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#1a5276',borderRadius:12,paddingVertical:16,gap:12,marginBottom:10},
  pdfBtnT:{fontSize:17,fontWeight:'700',color:'#FFF'},
  eduWarn:{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'rgba(255,193,7,0.1)',borderWidth:1,borderColor:'rgba(255,193,7,0.3)',padding:12,borderRadius:10,marginBottom:12},
  eduWarnT:{flex:1,fontSize:11,color:'#ffc107',lineHeight:16},
  homeBtn:{flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#667eea',borderRadius:12,paddingVertical:14,gap:10,marginBottom:20},
  homeBtnT:{fontSize:16,fontWeight:'700',color:'#FFF'},
});
