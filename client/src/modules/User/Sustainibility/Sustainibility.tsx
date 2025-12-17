import MainLayout from '../../../layout/MainLayout'
import { Box, Link, Typography } from '@mui/material'
import { COLORS } from '../../../constant/color'

const Sustainibility = () => {
    return (
        <MainLayout>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "30px",
                    width: { lg: "1340px", md: "100%", sm: "100%", xs: "100%" },
                    justifyContent: "center",
                    m: "auto",
                    p: { lg: 3, md: 3, sm: 3, xs: 1 },
                    mb: { md: 9, sm: 6, xs: 4 }
                }}
            >
                <Box component={'img'} src='/assets/images/DIYsustainbility.png' sx={{ width: '100%', height: { md: '400px', sm: '400px', xs: 'auto' }, objectFit: 'contain' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'start', justifyContent: 'center', width: { md: 750, sm: 600, xs: '100%' }, m: 'auto', p: 2 }}>
                    <Typography sx={{ fontFamily: "Arial, sans-serif", color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>While pink will forever be our favourite colour, here at DIY Personalisation we’re doing what we can to be more green.</Typography>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>As we’re always encouraging you to let people know that you care, we want to reassure you that we care, too. We recognise that the future of the natural world depends on all of us coming together to make a change, so we’re committed to working towards a more sustainable future and a healthier, happier planet for everyone.</Typography>
                </Box>

                <Typography sx={{
                    // fontFamily: "'Dancing Script', Arial, sans-serif",
                    fontSize: { md: '40px', sm: '30px', xs: '20px' },
                    color: COLORS.seconday,
                    p: 2,
                    textAlign: 'center',
                    fontWeight: 700
                }}>What we have done so far</Typography>

                <Box component={'img'} src='/assets/images/Mail-birds.jpg' sx={{ width: '100%', height: { md: '400px', sm: '400px', xs: 'auto' }, objectFit: 'contain' }} />

                <Box>
                    {/* <Box
                        component={'img'}
                        src='https://images.ctfassets.net/3m6f3dx67i1j/1VN2cONt5LoytbxRLj2AfM/751cd2400b0b594eb3ec6f3dac5cbd85/image__8_.png'
                        sx={{ width: '80%', height: 'auto', display: 'flex', m: 'auto' }}
                    /> */}
                    <Typography>

                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'start', justifyContent: 'center', width: { md: 750, sm: 600, xs: '100%' }, m: 'auto', p: 2, gap: '20px' }}>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>Also, all <Link href='/'>DIY Personalisation cards</Link> are printed locally in the UK (England and Guernsey, to be precise!), Ireland, the U.S. or Australia. By selling on-demand, custom-printed cards and introducing smaller packaging options for our gifts range, we’re reducing wasted resources by only using what we need.</Typography>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>Where some see waste, we see potential!</Typography>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>There’s been a closed-loop waste system implemented at our Flowers Hub, which means nothing used when preparing our flowers ever enters the landfill. Instead, when our flowers are prepared, all the offcuts and stray leaves are salvaged and sent to processing plants and paper mills where the green waste is collected and used to produce packing materials without the need for new resources. Clever!!</Typography>
                </Box>


                <Typography sx={{
                    // fontFamily: "'Dancing Script', Arial, sans-serif",
                    fontSize: { md: '40px', sm: '30px', xs: '20px' },
                    color: COLORS.seconday,
                    p: 2,
                    textAlign: 'center',
                    fontWeight: 700
                }}>What we are Working on</Typography>


                <Box component={'img'} src='/assets/images/DIY-planting.jpg' sx={{ width: '100%', height: { md: '400px', sm: '400px', xs: 'auto' }, objectFit: 'contain' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'start', justifyContent: 'center', width: { md: 750, sm: 600, xs: '100%' }, m: 'auto', p: 2, gap: '20px' }}>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>Why not <Link href='#'>visit our virtual forest</Link> to find out more?</Typography>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>By April 2022 we planted 96,000 trees with our partner Tree-Nation, a non-profit organisation that allows people and companies to plant trees all around the world and offset their CO2 emissions. Planting trees is one of the most efficient solutions in fighting climate change, and through Tree-Nation’s reforestation and conservation projects they also help to create jobs, support local communities and protect biodiversity.</Typography>
                </Box>

                <Box component={'img'} src='/assets/images/DIY-achive.jpg' sx={{ width: '100%', height: { md: '400px', sm: '400px', xs: 'auto' }, objectFit: 'contain' }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'start', justifyContent: 'center', width: { md: 750, sm: 600, xs: '100%' }, m: 'auto', p: 2, gap: '20px' }}>
                    <Typography sx={{ fontFamily: 'Arial, sans-serif', color: '#3d3d3dff', fontSize: { md: 17, sm: 17, xs: 14 } }}>Put simply, net-zero means achieving a balance between the carbon emitted into the atmosphere and the carbon removed from it. Our goal is to reduce our emissions and remove any remaining emissions through greenhouse gas removal projects such as reforestation. </Typography>
                </Box>


                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        justifyContent: "center",
                        width: { md: 700, sm: 600, xs: "100%" },
                        m: "auto",
                        gap: "10px",
                    }}
                >

                    {/* Title */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "black",
                            fontSize: { md: 25, sm: 20, xs: 18 },
                            fontWeight: 700,
                        }}
                    >
                        1. Reducing our greenhouse gas emissions (Scope 1 and 2) by more than 50%.
                    </Typography>

                    {/* Description */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "#3d3d3dff",
                            fontSize: { md: 17, sm: 17, xs: 14 },
                        }}
                    >
                        Scope 1 covers direct emissions from operations that are owned or controlled
                        by DIY Personalisation, while Scope 2 covers indirect emissions from purchased or
                        acquired electricity, steam, heating, or cooling consumed by our company.
                    </Typography>

                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        justifyContent: "center",
                        width: { md: 700, sm: 600, xs: "100%" },
                        m: "auto",
                        gap: "10px",
                    }}
                >

                    {/* Title */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "black",
                            fontSize: { md: 25, sm: 20, xs: 18 },
                            fontWeight: 700,
                        }}
                    >
                        2. Reducing our energy use and ensuring the energy we use is clean where possible.
                    </Typography>

                    {/* Description */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "#3d3d3dff",
                            fontSize: { md: 17, sm: 17, xs: 14 },
                        }}
                    >
                        We currently purchase renewable electricity for all of our sites and our Guernsey site is completely gas-free!
                    </Typography>

                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        justifyContent: "center",
                        width: { md: 700, sm: 600, xs: "100%" },
                        m: "auto",
                        gap: "10px",
                    }}
                >

                    {/* Title */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "black",
                            fontSize: { md: 25, sm: 20, xs: 18 },
                            fontWeight: 700,
                        }}
                    >
                        3. Offsetting emissions on a yearly basis.
                    </Typography>

                    {/* Description */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "#3d3d3dff",
                            fontSize: { md: 17, sm: 17, xs: 14 },
                        }}
                    >
                        Trees eat carbon dioxide for breakfast! Since May of 2020, we offset all of our operational greenhouse gas emissions every year.
                    </Typography>

                </Box>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        textAlign: "start",
                        justifyContent: "center",
                        width: { md: 700, sm: 600, xs: "100%" },
                        m: "auto",
                        gap: "10px",
                    }}
                >

                    {/* Title */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "black",
                            fontSize: { md: 25, sm: 20, xs: 18 },
                            fontWeight: 700,
                        }}
                    >
                        4. Measuring and reducing our Scope 3 value chain greenhouse gas emissions.
                    </Typography>

                    {/* Description */}
                    <Typography
                        sx={{
                            fontFamily: "Arial, sans-serif",
                            color: "#3d3d3dff",
                            fontSize: { md: 17, sm: 17, xs: 14 },
                        }}
                    >
                        Scope 3 refers to indirect emissions that occur in our company’s value chain. We’re also starting to look at emissions in our products, distribution and our IT footprint.
                    </Typography>

                </Box>


            </Box>
        </MainLayout>
    )
}

export default Sustainibility