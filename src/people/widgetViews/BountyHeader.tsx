/* eslint-disable @typescript-eslint/no-unused-vars */
import { EuiCheckboxGroup, EuiPopover, EuiText } from '@elastic/eui';
import MaterialIcon from '@material/react-material-icon';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';
import IconButton from 'components/common/IconButton2';
import { useHistory } from 'react-router-dom';
import { BountyHeaderProps } from 'people/interfaces';
import api from 'api';
import { colors } from '../../config/colors';
import { useIsMobile } from '../../hooks';
import { SearchBar } from '../../components/common/index';
import { useStores } from '../../store';
import { filterCount } from '../../helpers';
import { GetValue, coding_languages, status } from '../utils/languageLabelStyle';
import { PostBounty } from './postBounty';

const Status = GetValue(status);
const Coding_Languages = GetValue(coding_languages);

interface styledProps {
  color?: any;
}

const BountyHeaderDesk = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  min-width: 1100px;
  max-width: 1100px;
`;

const B = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
`;

const D = styled.div<styledProps>`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  .DText {
    font-size: 16px;
    font-family: 'Barlow';
    font-weight: 500;
  }
  .ImageOuterContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    color: ${(p: any) => p.color && p.color.grayish.G200};
    padding: 0 10px;
  }
`;

const DevelopersImageContainer = styled.div<styledProps>`
  height: 28px;
  width: 28px;
  border-radius: 50%;
  background: ${(p: any) => p.color && p.color.pureWhite};
  overflow: hidden;
  position: static;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BountyHeaderMobile = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 16px;
`;

const ShortActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DevelopersContainerMobile = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const LargeActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FilterContainer = styled.div<styledProps>`
  width: 78px;
  height: 48px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-left: 19px;
  cursor: pointer;
  user-select: none;
  .filterImageContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 48px;
    width: 36px;
    .materialIconImage {
      color: ${(p: any) => p.color && p.color.grayish.G200};
      cursor: pointer;
      font-size: 18px;
      margin-top: 4px;
    }
  }
  .filterText {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    display: flex;
    align-items: center;
    color: ${(p: any) => p.color && p.color.grayish.G50};
  }
  &:hover {
    .filterImageContainer {
      .materialIconImage {
        color: ${(p: any) => p.color && p.color.grayish.G10} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 4px;
      }
    }
    .filterText {
      color: ${(p: any) => p.color && p.color.grayish.G10};
    }
  }
  &:active {
    .filterImageContainer {
      .materialIconImage {
        color: ${(p: any) => p.color && p.color.grayish.G10} !important;
        cursor: pointer;
        font-size: 18px;
        margin-top: 4px;
      }
    }
    .filterText {
      color: ${(p: any) => p.color && p.color.grayish.G10};
    }
  }
`;

const FilterCount = styled.div<styledProps>`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  margin-left: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;
  background: ${(p: any) => p?.color && p.color.blue1};
  .filterCountText {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    display: flex;
    align-items: center;
    text-align: center;
    color: ${(p: any) => p.color && p.color.pureWhite};
  }
`;

const MobileFilterCount = styled.div<styledProps>`
  height: 20px;
  width: 20px;
  border-radius: 50%;
  margin-left: -8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -5px;
  background: ${(p: any) => p?.color && p.color.blue1};
  .filterCountText {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 500;
    font-size: 13px;
    display: flex;
    align-items: center;
    text-align: center;
    color: ${(p: any) => p.color && p.color.pureWhite};
  }
`;

const EuiPopOverCheckboxLeft = styled.div<styledProps>`
  width: 147px;
  height: auto;
  padding: 15px 18px;
  border-right: 1px solid ${(p: any) => p.color && p.color.grayish.G700};
  user-select: none;
  .leftBoxHeading {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 32px;
    text-transform: uppercase;
    color: ${(p: any) => p.color && p.color.grayish.G100};
    margin-bottom: 10px;
  }

  &.CheckboxOuter > div {
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;

    .euiCheckboxGroup__item {
      .euiCheckbox__square {
        top: 5px;
        border: 1px solid ${(p: any) => p?.color && p?.color?.grayish.G500};
        border-radius: 2px;
      }
      .euiCheckbox__input + .euiCheckbox__square {
        background: ${(p: any) => p?.color && p?.color?.pureWhite} no-repeat center;
      }
      .euiCheckbox__input:checked + .euiCheckbox__square {
        border: 1px solid ${(p: any) => p?.color && p?.color?.blue1};
        background: ${(p: any) => p?.color && p?.color?.blue1} no-repeat center;
        background-image: url('static/checkboxImage.svg');
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
        &:hover {
          color: ${(p: any) => p?.color && p?.color?.grayish.G05};
        }
      }
      input.euiCheckbox__input:checked ~ label {
        color: ${(p: any) => p?.color && p?.color?.blue1};
      }
    }
  }
  @media (max-width: 768px) {
    padding: 5px 18px;
    .leftBoxHeading {
      margin-bottom: 5px;
    }

    .euiCheckboxGroup__item {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
`;

const PopOverRightBox = styled.div<styledProps>`
  display: flex;
  flex-direction: column;
  max-height: auto;
  padding: 15px 0px 20px 21px;
  .rightBoxHeading {
    font-family: 'Barlow';
    font-style: normal;
    font-weight: 700;
    font-size: 12px;
    line-height: 32px;
    text-transform: uppercase;
    color: ${(p: any) => p.color && p.color.grayish.G100};
  }
  @media (max-width: 768px) {
    padding: 5px 0px 5px 21px;
    .rightBoxHeading {
      margin-bottom: 5px;
    }
  }
`;

const EuiPopOverCheckboxRight = styled.div<styledProps>`
  min-width: 285px;
  max-width: 285px;
  height: auto;
  user-select: none;

  &.CheckboxOuter > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    justify-content: center;
    .euiCheckboxGroup__item {
      .euiCheckbox__square {
        top: 5px;
        border: 1px solid ${(p: any) => p?.color && p?.color?.grayish.G500};
        border-radius: 2px;
      }
      .euiCheckbox__input + .euiCheckbox__square {
        background: ${(p: any) => p?.color && p?.color?.pureWhite} no-repeat center;
      }
      .euiCheckbox__input:checked + .euiCheckbox__square {
        border: 1px solid ${(p: any) => p?.color && p?.color?.blue1};
        background: ${(p: any) => p?.color && p?.color?.blue1} no-repeat center;
        background-image: url('static/checkboxImage.svg');
      }
      .euiCheckbox__label {
        font-family: 'Barlow';
        font-style: normal;
        font-weight: 500;
        font-size: 13px;
        line-height: 16px;
        color: ${(p: any) => p?.color && p?.color?.grayish.G50};
        &:hover {
          color: ${(p: any) => p?.color && p?.color?.grayish.G05};
        }
      }
      input.euiCheckbox__input:checked ~ label {
        color: ${(p: any) => p?.color && p?.color?.blue1};
      }
    }
  }
`;

const BountyHeader = ({
  selectedWidget,
  scrollValue,
  onChangeStatus,
  onChangeLanguage,
  checkboxIdToSelectedMap,
  checkboxIdToSelectedMapLanguage
}: BountyHeaderProps) => {
  const color = colors['light'];
  const { main, ui } = useStores();
  const isMobile = useIsMobile();
  const [peopleList, setPeopleList] = useState<Array<any> | null>(null);
  const [developerCount, setDeveloperCount] = useState<number>(0);
  const [activeBounty, setActiveBounty] = useState<Array<any> | number | null>(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [filterCountNumber, setFilterCountNumber] = useState<number>(0);
  const history = useHistory();

  const onButtonClick = () => setIsPopoverOpen((isPopoverOpen: any) => !isPopoverOpen);
  const closePopover = () => setIsPopoverOpen(false);
  useEffect(() => {
    // eslint-disable-next-line func-style
    async function getPeopleList() {
      if (selectedWidget === 'bounties') {
        try {
          const responseNew = await main.getBountyHeaderData();
          setPeopleList(responseNew.people);
          setDeveloperCount(responseNew?.developer_count || 0);
          setActiveBounty(responseNew?.bounties_count);
        } catch (error) {
          console.log(error);
        }
      } else {
        setPeopleList(null);
      }
    }
    getPeopleList();
  }, [main, selectedWidget]);

  const [counts, setCounts] = useState({
    open: 0,
    assigned: 0,
    completed: 0,
    paid: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    // Fetch counts from the API
    async function fetchCounts() {
      try {
        const response = await api.get('gobounties/filter/count');
        setCounts({
          open: response.open || 0,
          assigned: response.assigned || 0,
          completed: response.completed || 0,
          paid: response.paid || 0,
          pending: response.pending || 0,
          failed: response.failed || 0
        });
      } catch (error) {
        console.error('Error fetching filter counts:', error);
      }
    }

    fetchCounts();
  }, []);

  useEffect(() => {
    setFilterCountNumber(
      filterCount(checkboxIdToSelectedMapLanguage) + filterCount(checkboxIdToSelectedMap)
    );
  }, [checkboxIdToSelectedMapLanguage, checkboxIdToSelectedMap]);

  const getBounties = () => {
    main.getPeopleBounties({
      page: 1,
      resetPage: true,
      ...checkboxIdToSelectedMap,
      ...checkboxIdToSelectedMapLanguage
    });
  };

  const handleSearch = (e: any) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      getBounties();
    }
  };

  const clearSearch = () => {
    getBounties();
  };

  let timeoutId;
  const onChangeSearch = (e: any) => {
    ui.setSearchText(e);
    clearTimeout(timeoutId);
    // Set a new timeout to wait for user to pause typing
    timeoutId = setTimeout(() => {
      if (ui.searchText === '') {
        clearSearch();
      }
    }, 1000);
  };

  return (
    <>
      {!isMobile ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            minHeight: '80px',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 1,
            background: 'inherit',
            boxShadow: scrollValue ? `0px 1px 6px ${color.black100}` : '',
            borderBottom: scrollValue
              ? `1px solid ${color.grayish.G600}`
              : `0px solid ${color.grayish.G600}`
          }}
        >
          <BountyHeaderDesk>
            <B>
              <PostBounty widget={selectedWidget} />
              <IconButton
                width={150}
                height={isMobile ? 36 : 48}
                text="Leaderboard"
                onClick={() => {
                  history.push('/leaderboard');
                }}
                style={{
                  marginLeft: '10px'
                }}
              />
              <SearchBar
                data-testid="search-bar"
                name="search"
                type="search"
                placeholder={`Search across ${activeBounty} Bounties`}
                value={ui.searchText}
                style={{
                  width: 298,
                  height: 48,
                  background: color.grayish.G600,
                  marginLeft: '16px',
                  fontFamily: 'Barlow',
                  color: color.text2
                }}
                onChange={onChangeSearch}
                onKeyUp={handleSearch}
                iconStyle={{
                  top: '13px'
                }}
                TextColor={color.grayish.G50}
                TextColorHover={color.grayish.G10}
                border={`1px solid ${color.grayish.G600}`}
                borderHover={`1px solid ${color.grayish.G400}`}
                borderActive={`1px solid ${color.light_blue100}`}
                iconColor={color.grayish.G50}
                iconColorHover={color.grayish.G10}
              />

              <EuiPopover
                button={
                  <FilterContainer
                    onClick={onButtonClick}
                    color={color}
                    role="button"
                    aria-label={`Filter search, ${filterCountNumber} filter${
                      filterCountNumber === 1 ? '' : 's'
                    } applied`}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onButtonClick();
                      }
                    }}
                  >
                    <div className="filterImageContainer">
                      <MaterialIcon
                        className="materialIconImage"
                        icon="tune"
                        style={{
                          color: isPopoverOpen ? color.grayish.G10 : ''
                        }}
                      />
                    </div>
                    <EuiText
                      className="filterText"
                      style={{
                        color: isPopoverOpen ? color.grayish.G10 : ''
                      }}
                    >
                      Filter
                    </EuiText>
                  </FilterContainer>
                }
                panelStyle={{
                  border: 'none',
                  boxShadow: `0px 1px 20px ${color.black90}`,
                  background: `${color.pureWhite}`,
                  borderRadius: '6px',
                  minWidth: '432px',
                  minHeight: '304px',
                  marginTop: '0px',
                  marginLeft: '20px'
                }}
                isOpen={isPopoverOpen}
                closePopover={closePopover}
                panelClassName="yourClassNameHere"
                panelPaddingSize="none"
                anchorPosition="downLeft"
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row'
                  }}
                >
                  <EuiPopOverCheckboxLeft className="CheckboxOuter" color={color}>
                    <EuiText className="leftBoxHeading">STATUS</EuiText>
                    <EuiCheckboxGroup
                      options={status.map((status: any) => ({
                        label: `${status} [${counts[status.toLowerCase()]}]`, // Use counts to display the corresponding count
                        id: status
                      }))}
                      idToSelectedMap={checkboxIdToSelectedMap}
                      onChange={(id: any) => {
                        onChangeStatus(id);
                      }}
                    />
                  </EuiPopOverCheckboxLeft>
                  <PopOverRightBox color={color}>
                    <EuiText className="rightBoxHeading">Tags</EuiText>
                    <EuiPopOverCheckboxRight className="CheckboxOuter" color={color}>
                      <EuiCheckboxGroup
                        options={Coding_Languages}
                        idToSelectedMap={checkboxIdToSelectedMapLanguage}
                        onChange={(id: any) => {
                          onChangeLanguage(id);
                        }}
                      />
                    </EuiPopOverCheckboxRight>
                  </PopOverRightBox>
                </div>
              </EuiPopover>
              {filterCountNumber > 0 && (
                <FilterCount color={color}>
                  <EuiText className="filterCountText">{filterCountNumber}</EuiText>
                </FilterCount>
              )}
            </B>
            <div
              onClick={() => history.replace('/p')}
              role="button"
              aria-label={`Developers, ${developerCount} developers${
                developerCount === 1 ? '' : 's'
              } found`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  history.replace('/p');
                }
              }}
            >
              <D color={color}>
                <EuiText className="DText" color={color.grayish.G50}>
                  Developers
                </EuiText>
                <div className="ImageOuterContainer">
                  {peopleList &&
                    peopleList?.slice(0, 3).map((val: any, index: number) => (
                      <DevelopersImageContainer
                        color={color}
                        key={index}
                        style={{
                          zIndex: 3 - index,
                          marginLeft: index > 0 ? '-14px' : '',
                          objectFit: 'cover'
                        }}
                      >
                        <img
                          height={'23px'}
                          width={'23px'}
                          src={val?.img || '/static/person_placeholder.png'}
                          alt={''}
                          style={{
                            borderRadius: '50%'
                          }}
                        />
                      </DevelopersImageContainer>
                    ))}
                </div>
                <EuiText
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: 'Barlow',
                    color: color.black400
                  }}
                >
                  {developerCount}
                </EuiText>
              </D>
            </div>
          </BountyHeaderDesk>
        </div>
      ) : (
        <BountyHeaderMobile>
          <LargeActionContainer>
            <SearchBar
              name="search"
              type="search"
              placeholder={`Search across ${activeBounty} Bounties`}
              value={ui.searchText}
              style={{
                width: 240,
                height: 32,
                background: 'transparent',
                fontFamily: 'Barlow'
              }}
              onChange={(e: any) => {
                ui.setSearchText(e);
              }}
              iconStyle={{
                top: '4px'
              }}
              TextColor={color.grayish.G50}
              TextColorHover={color.grayish.G10}
              border={`1px solid ${color.grayish.G500}`}
              borderHover={`1px solid ${color.grayish.G400}`}
              borderActive={`1px solid ${color.light_blue100}`}
              iconColor={color.grayish.G50}
              iconColorHover={color.grayish.G10}
            />

            <EuiPopover
              button={
                <FilterContainer
                  onClick={onButtonClick}
                  color={color}
                  role="button"
                  aria-label={`Filter search, ${filterCountNumber} filter${
                    filterCountNumber === 1 ? '' : 's'
                  } applied`}
                  tabIndex={0}
                >
                  <div className="filterImageContainer">
                    <MaterialIcon
                      className="materialIconImage"
                      icon="tune"
                      style={{
                        color: isPopoverOpen ? color.grayish.G10 : ''
                      }}
                    />
                  </div>
                  <EuiText
                    className="filterText"
                    style={{
                      color: isPopoverOpen ? color.grayish.G10 : ''
                    }}
                  >
                    Filter
                  </EuiText>
                </FilterContainer>
              }
              panelStyle={{
                border: 'none',
                boxShadow: `0px 1px 20px ${color.black90}`,
                background: `${color.pureWhite}`,
                borderRadius: '6px'
              }}
              isOpen={isPopoverOpen}
              closePopover={closePopover}
              panelClassName="yourClassNameHere"
              panelPaddingSize="none"
              anchorPosition="downRight"
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <EuiPopOverCheckboxLeft className="CheckboxOuter" color={color}>
                  <EuiText className="leftBoxHeading">STATUS</EuiText>
                  <EuiCheckboxGroup
                    options={Status}
                    idToSelectedMap={checkboxIdToSelectedMap}
                    onChange={(id: any) => {
                      onChangeStatus(id);
                    }}
                  />
                </EuiPopOverCheckboxLeft>
                <PopOverRightBox color={color}>
                  <EuiText className="rightBoxHeading">Tags</EuiText>
                  <EuiPopOverCheckboxRight className="CheckboxOuter" color={color}>
                    <EuiCheckboxGroup
                      options={Coding_Languages}
                      idToSelectedMap={checkboxIdToSelectedMapLanguage}
                      onChange={(id: any) => {
                        onChangeLanguage(id);
                      }}
                    />
                  </EuiPopOverCheckboxRight>
                </PopOverRightBox>
              </div>
            </EuiPopover>
            {filterCountNumber > 0 && (
              <MobileFilterCount color={color}>
                <EuiText className="filterCountText">{filterCountNumber}</EuiText>
              </MobileFilterCount>
            )}
          </LargeActionContainer>
          <ShortActionContainer>
            <PostBounty widget={selectedWidget} />
            <IconButton
              width={150}
              height={isMobile ? 36 : 48}
              text="Leaderboard"
              onClick={() => {
                history.push('/leaderboard');
              }}
              style={{
                marginLeft: '10px',
                marginRight: 'auto'
              }}
            />
            <DevelopersContainerMobile>
              {peopleList &&
                peopleList?.slice(0, 3).map((val: any, index: number) => (
                  <DevelopersImageContainer
                    key={index}
                    color={color}
                    style={{
                      zIndex: 3 - index,
                      marginLeft: index > 0 ? '-14px' : ''
                    }}
                  >
                    <img
                      height={'20px'}
                      width={'20px'}
                      src={val?.img || '/static/person_placeholder.png'}
                      alt={''}
                      style={{
                        borderRadius: '50%'
                      }}
                    />
                  </DevelopersImageContainer>
                ))}
              <EuiText
                style={{
                  fontSize: '14px',
                  fontFamily: 'Barlow',
                  fontWeight: 500,
                  color: color.black400
                }}
              >
                {developerCount}
              </EuiText>
            </DevelopersContainerMobile>
          </ShortActionContainer>
        </BountyHeaderMobile>
      )}
    </>
  );
};

export default observer(BountyHeader);
